"""
Data loading utilities for Estora real estate datasets.

Provides safe, non-destructive reading of raw CSV and compressed ZIP archives
without extracting unneeded files or modifying underlying sources.
"""

from __future__ import annotations

import csv
import io
import zipfile
from pathlib import Path
from typing import Dict, List, Optional


def load_csv_from_zip(
    zip_path: Path | str,
    internal_filename: str = "processed/train_cleaned.csv",
    encoding: str = "utf-8",
) -> List[Dict[str, str]]:
    """
    Safely read a specific CSV entry from a ZIP archive into a list of row dictionaries.

    Raises:
        FileNotFoundError: If the zip archive or entry within the archive does not exist.
        ValueError: If the file is empty or corrupted.
    """
    path = Path(zip_path).resolve()
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset archive not found: {path}. "
            "Please ensure the raw data archive is placed under ml/training/data/raw/."
        )

    try:
        with zipfile.ZipFile(path, "r") as z:
            available = z.namelist()
            if internal_filename not in available:
                raise FileNotFoundError(
                    f"Entry '{internal_filename}' not found inside archive {path.name}. "
                    f"Available entries: {available}"
                )
            with z.open(internal_filename) as f:
                reader = csv.DictReader(io.TextIOWrapper(f, encoding=encoding, errors="replace"))
                rows = list(reader)
    except zipfile.BadZipFile as e:
        raise ValueError(f"Corrupted or invalid ZIP archive at {path}: {e}") from e

    if not rows:
        raise ValueError(f"No records found in {internal_filename} inside {path.name}.")

    return rows


def load_csv_file(
    file_path: Path | str,
    encoding: str = "utf-8",
) -> List[Dict[str, str]]:
    """
    Safely read a standard CSV file into a list of row dictionaries.
    """
    path = Path(file_path).resolve()
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {path}")

    with open(path, "r", encoding=encoding, errors="replace") as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    return rows
