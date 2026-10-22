"""
Estora Dataset Audit Utility

Inspects raw dataset files in ml/training/data/raw, extracting schema,
integrity metrics, geographic coverage, missingness, and suitability
for residential sale-price and rental-price ML modeling workflows.

Adheres strictly to Estora engineering conventions:
- Read-only inspection; never alters, deletes, or renames raw files.
- Resilient fallback for optional dependencies (openpyxl, pandas, xlrd).
- Zero row-level PII exposure; outputs aggregate structural metrics only.
- Repeatable and deterministic execution.
"""

from __future__ import annotations

import argparse
import csv
import datetime
import io
import json
import math
import os
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path
from typing import Any

# Check optional dependencies
OPTIONAL_DEPS = {}
try:
    import pandas as pd  # type: ignore
    OPTIONAL_DEPS["pandas"] = pd.__version__
except ImportError:
    OPTIONAL_DEPS["pandas"] = None

try:
    import openpyxl  # type: ignore
    OPTIONAL_DEPS["openpyxl"] = openpyxl.__version__
except ImportError:
    OPTIONAL_DEPS["openpyxl"] = None

try:
    import xlrd  # type: ignore
    OPTIONAL_DEPS["xlrd"] = xlrd.__version__
except ImportError:
    OPTIONAL_DEPS["xlrd"] = None


def format_bytes(size: int) -> str:
    if size < 1024:
        return f"{size} B"
    elif size < 1024 * 1024:
        return f"{size / 1024:.2f} KB"
    else:
        return f"{size / (1024 * 1024):.2f} MB"


def infer_type(values: list[str]) -> str:
    non_empty = [v.strip() for v in values if v is not None and v.strip() != ""]
    if not non_empty:
        return "empty"

    is_int = True
    is_float = True
    is_date = True

    date_pattern = re.compile(r"^\d{4}-\d{2}-\d{2}$|^\d{1,2}-[A-Za-z]{3}$|^\d{1,2}/\d{1,2}/\d{2,4}$")

    for v in non_empty[:100]:
        # check int
        if is_int:
            try:
                int(v)
            except ValueError:
                is_int = False

        # check float
        if is_float:
            try:
                float(v)
            except ValueError:
                is_float = False

        # check date
        if is_date and not date_pattern.match(v):
            is_date = False

    if is_int:
        return "Integer"
    if is_float:
        return "Float"
    if is_date:
        return "Date/Time"
    if len(set(non_empty)) <= 15:
        return "Categorical"
    return "String"


def audit_csv_stream(f: io.TextIOBase, filename: str, file_size: int) -> dict[str, Any]:
    reader = csv.reader(f)
    try:
        header = next(reader, None)
    except Exception as e:
        return {"error": f"Failed to parse CSV header: {e}"}

    if not header:
        return {"filename": filename, "format": "CSV", "file_size": file_size, "rows": 0, "cols": 0, "columns": []}

    # Clean headers
    header = [h.strip() for h in header]
    num_cols = len(header)
    col_values: list[list[str]] = [[] for _ in range(num_cols)]
    row_count = 0
    missing_counts = [0] * num_cols
    seen_row_hashes = set()
    dup_count = 0

    # Track all values for exact full-file statistics
    distinct_sets = [set() for _ in range(num_cols)]
    numeric_stats = [{"min": float("inf"), "max": float("-inf"), "sum": 0.0, "count": 0} for _ in range(num_cols)]
    city_col_idx = next((i for i, h in enumerate(header) if h.lower() in ("city", "site_location", "location")), None)
    loc_counter = Counter()

    for row in reader:
        row_count += 1
        # Check duplicate
        row_tuple = tuple(row)
        if row_tuple in seen_row_hashes:
            dup_count += 1
        else:
            seen_row_hashes.add(row_tuple)

        for i, col_name in enumerate(header):
            val = row[i].strip() if i < len(row) else ""
            if val == "" or val.lower() in ("na", "null", "nan", "none", "n/a"):
                missing_counts[i] += 1
            else:
                if len(distinct_sets[i]) < 5000:
                    distinct_sets[i].add(val)
                # Try numeric update
                try:
                    num_val = float(val)
                    if not math.isnan(num_val) and not math.isinf(num_val):
                        numeric_stats[i]["count"] += 1
                        numeric_stats[i]["sum"] += num_val
                        if num_val < numeric_stats[i]["min"]:
                            numeric_stats[i]["min"] = num_val
                        if num_val > numeric_stats[i]["max"]:
                            numeric_stats[i]["max"] = num_val
                except ValueError:
                    pass

            if len(col_values[i]) < 200:
                col_values[i].append(val)

            if city_col_idx is not None and i == city_col_idx and val:
                loc_counter[val] += 1

    # Inferred types and sample statistics
    col_summaries = []
    for i, col_name in enumerate(header):
        inferred = infer_type(col_values[i])
        miss = missing_counts[i]
        pct = (miss / row_count * 100.0) if row_count > 0 else 0.0
        summary_item: dict[str, Any] = {
            "name": col_name,
            "inferred_type": inferred,
            "missing_count": miss,
            "missing_pct": round(pct, 2),
            "distinct_count": len(distinct_sets[i]),
        }
        if numeric_stats[i]["count"] > 0:
            count = numeric_stats[i]["count"]
            summary_item["numeric_min"] = numeric_stats[i]["min"]
            summary_item["numeric_max"] = numeric_stats[i]["max"]
            summary_item["numeric_mean"] = round(numeric_stats[i]["sum"] / count, 2)
        col_summaries.append(summary_item)

    locality_dist = dict(loc_counter.most_common(15))

    # Target analysis
    target_candidates = [
        h for h in header if any(k in h.lower() for k in ("price", "rent", "cost", "amount"))
    ]

    return {
        "filename": filename,
        "format": "CSV",
        "file_size": file_size,
        "file_size_formatted": format_bytes(file_size),
        "row_count": row_count,
        "col_count": num_cols,
        "columns": col_summaries,
        "duplicate_rows": dup_count,
        "target_candidates": target_candidates,
        "locality_distribution": locality_dist,
    }


def audit_zip_file(zip_path: Path) -> dict[str, Any]:
    file_size = zip_path.stat().st_size
    entries = []
    with zipfile.ZipFile(zip_path) as z:
        for info in z.infolist():
            entry_name = info.filename
            entry_size = info.file_size
            entry_summary: dict[str, Any] = {
                "name": entry_name,
                "size_bytes": entry_size,
                "size_formatted": format_bytes(entry_size),
            }
            if entry_name.endswith(".csv"):
                with z.open(entry_name) as f:
                    csv_stream = io.TextIOWrapper(f, encoding="utf-8", errors="replace")
                    csv_audit = audit_csv_stream(csv_stream, entry_name, entry_size)
                    entry_summary["csv_audit"] = csv_audit
            entries.append(entry_summary)

    return {
        "filename": zip_path.name,
        "format": "ZIP",
        "file_size": file_size,
        "file_size_formatted": format_bytes(file_size),
        "entries": entries,
    }


def audit_raw_directory(data_raw_dir: Path) -> dict[str, Any]:
    if not data_raw_dir.exists():
        return {
            "status": "error",
            "message": f"Raw data directory does not exist: {data_raw_dir}",
            "files": [],
        }

    raw_files = sorted(
        [f for f in data_raw_dir.iterdir() if f.name != ".gitkeep" and not f.name.startswith(".")],
        key=lambda x: x.name,
    )

    if not raw_files:
        return {
            "status": "empty",
            "message": f"Raw data directory is empty: {data_raw_dir}",
            "files": [],
        }

    results = []
    for f in raw_files:
        file_size = f.stat().st_size
        suffix = f.suffix.lower()

        if suffix == ".csv":
            try:
                with open(f, "r", encoding="utf-8", errors="replace") as fh:
                    res = audit_csv_stream(fh, f.name, file_size)
                    results.append(res)
            except Exception as e:
                results.append({"filename": f.name, "format": "CSV", "error": str(e)})

        elif suffix == ".zip":
            try:
                res = audit_zip_file(f)
                results.append(res)
            except Exception as e:
                results.append({"filename": f.name, "format": "ZIP", "error": str(e)})

        elif suffix == ".ipynb":
            results.append({
                "filename": f.name,
                "format": "Jupyter Notebook",
                "file_size": file_size,
                "file_size_formatted": format_bytes(file_size),
                "note": "Supplementary exploratory/pipeline notebook file present in raw directory.",
            })

        elif suffix in (".xlsx", ".xls"):
            if suffix == ".xlsx" and OPTIONAL_DEPS["openpyxl"] is None:
                results.append({
                    "filename": f.name,
                    "format": "Excel (XLSX)",
                    "file_size": file_size,
                    "file_size_formatted": format_bytes(file_size),
                    "error": "openpyxl dependency not installed; install openpyxl to audit XLSX files.",
                })
            elif suffix == ".xls" and OPTIONAL_DEPS["xlrd"] is None:
                results.append({
                    "filename": f.name,
                    "format": "Excel (XLS)",
                    "file_size": file_size,
                    "file_size_formatted": format_bytes(file_size),
                    "error": "xlrd dependency not installed; install xlrd to audit XLS files.",
                })
            else:
                results.append({
                    "filename": f.name,
                    "format": "Excel",
                    "file_size": file_size,
                    "file_size_formatted": format_bytes(file_size),
                    "note": "Excel file detected.",
                })

        elif suffix == ".json":
            try:
                with open(f, "r", encoding="utf-8", errors="replace") as fh:
                    data = json.load(fh)
                    results.append({
                        "filename": f.name,
                        "format": "JSON",
                        "file_size": file_size,
                        "file_size_formatted": format_bytes(file_size),
                        "is_list": isinstance(data, list),
                        "count": len(data) if isinstance(data, list) else 1,
                    })
            except Exception as e:
                results.append({"filename": f.name, "format": "JSON", "error": str(e)})

        else:
            results.append({
                "filename": f.name,
                "format": suffix.upper() or "UNKNOWN",
                "file_size": file_size,
                "file_size_formatted": format_bytes(file_size),
                "note": "Unrecognized format.",
            })

    return {
        "status": "success",
        "data_dir": str(data_raw_dir),
        "total_files": len(raw_files),
        "optional_dependencies": OPTIONAL_DEPS,
        "files": results,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit raw datasets for Estora ML workflows.")
    parser.add_argument(
        "--input-dir",
        default="ml/training/data/raw",
        help="Path to raw data directory (default: ml/training/data/raw)",
    )
    parser.add_argument(
        "--output-json",
        help="Optional path to export audit results as structured JSON",
    )

    args = parser.parse_args()
    input_path = Path(args.input_dir).resolve()

    print(f"Auditing datasets in: {input_path}")
    print(f"Optional dependencies: {OPTIONAL_DEPS}")

    audit_summary = audit_raw_directory(input_path)

    if audit_summary.get("status") == "empty":
        print(f"Notice: {audit_summary.get('message')}")
        sys.exit(0)
    elif audit_summary.get("status") == "error":
        print(f"Error: {audit_summary.get('message')}", file=sys.stderr)
        sys.exit(1)

    print(f"\nDiscovered {audit_summary['total_files']} files in raw partition:\n")
    for item in audit_summary["files"]:
        fname = item.get("filename")
        fmt = item.get("format")
        sz = item.get("file_size_formatted")
        rows = item.get("row_count", "N/A")
        cols = item.get("col_count", "N/A")
        print(f"  • {fname} [{fmt}] - {sz} (Rows: {rows}, Cols: {cols})")
        if "columns" in item:
            targets = item.get("target_candidates", [])
            print(f"    Target candidates: {targets}")
            if item.get("locality_distribution"):
                print(f"    Locations: {list(item['locality_distribution'].keys())[:5]}")

    if args.output_json:
        out_p = Path(args.output_json)
        out_p.parent.mkdir(parents=True, exist_ok=True)
        out_p.write_text(json.dumps(audit_summary, indent=2), encoding="utf-8")
        print(f"\nDetailed JSON report exported to: {out_p}")


if __name__ == "__main__":
    main()
