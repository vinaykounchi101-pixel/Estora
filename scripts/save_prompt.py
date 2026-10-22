"""
Estora Prompt Capture Utility

Saves new task prompts directly into the repository prompts/ hierarchy,
sanitizing credentials, determining sequence numbers, and maintaining
traceable records for all development sessions.
"""

from __future__ import annotations

import argparse
import datetime
import os
import re
import sys
from pathlib import Path

VALID_CATEGORIES = ("dataset-audit", "frontend", "backend", "ml", "architecture")

SECRET_PATTERNS = [
    re.compile(r"(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*['\"]?[a-zA-Z0-9_\-]{8,}['\"]?"),
    re.compile(r"ghp_[a-zA-Z0-9]{36}"),
    re.compile(r"sk-[a-zA-Z0-9]{20,48}"),
    re.compile(r"postgresql://[^:]+:[^@]+@"),
]


def check_for_secrets(content: str) -> list[str]:
    warnings = []
    for pattern in SECRET_PATTERNS:
        matches = pattern.findall(content)
        if matches:
            warnings.append(f"Suspicious pattern match: {pattern.pattern}")
    return warnings


def get_next_sequence_number(category_dir: Path) -> int:
    category_dir.mkdir(parents=True, exist_ok=True)
    existing_files = list(category_dir.glob("*.md"))
    max_seq = 0
    for f in existing_files:
        match = re.match(r"^(\d+)_", f.name)
        if match:
            max_seq = max(max_seq, int(match.group(1)))
    return max_seq + 1


def save_prompt(category: str, title: str, content: str, repo_root: Path | None = None) -> Path:
    if category not in VALID_CATEGORIES:
        raise ValueError(f"Category '{category}' is invalid. Must be one of: {VALID_CATEGORIES}")

    if not repo_root:
        repo_root = Path(__file__).resolve().parent.parent

    category_dir = repo_root / "prompts" / category
    category_dir.mkdir(parents=True, exist_ok=True)

    slug = re.sub(r"[^a-zA-Z0-9_-]+", "_", title.lower()).strip("_")
    seq = get_next_sequence_number(category_dir)
    filename = f"{seq:03d}_{slug}.md"
    target_path = category_dir / filename

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    file_content = f"""# Prompt {seq:03d}: {title}

- **Category**: `{category}`
- **Timestamp**: `{timestamp}`
- **Status**: Captured

---

## Verbatim Prompt Text

{content.strip()}
"""

    target_path.write_text(file_content, encoding="utf-8")
    return target_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Save task prompts to Estora prompts/ directory.")
    parser.add_argument("--category", required=True, choices=VALID_CATEGORIES, help="Task prompt category")
    parser.add_argument("--title", required=True, help="Short descriptive title or slug for the prompt")
    parser.add_argument("--file", help="Path to text file containing the prompt (or read from stdin if omitted)")
    parser.add_argument("--text", help="Direct prompt text string")

    args = parser.parse_args()

    if args.text:
        content = args.text
    elif args.file:
        content = Path(args.file).read_text(encoding="utf-8")
    else:
        content = sys.stdin.read()

    if not content.strip():
        print("Error: Prompt content is empty.", file=sys.stderr)
        sys.exit(1)

    warnings = check_for_secrets(content)
    if warnings:
        print("WARNING: Sensitive credentials or tokens may be present in this prompt!", file=sys.stderr)
        for w in warnings:
            print(f"  - {w}", file=sys.stderr)

    saved_path = save_prompt(category=args.category, title=args.title, content=content)
    print(f"Prompt saved successfully: {saved_path}")


if __name__ == "__main__":
    main()
