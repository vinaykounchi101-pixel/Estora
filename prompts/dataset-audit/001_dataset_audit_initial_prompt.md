# Prompt 001: Dataset Audit and Prompt Capture

- **Category**: `dataset-audit`
- **Timestamp**: `2026-10-22T15:09:42+05:30`
- **Branch**: `feat/dataset-audit`
- **Status**: Completed

---

## Verbatim Prompt Text

You are working on my existing GitHub repository: Estora, a real-estate price prediction and market analytics project focused initially on Pune, Maharashtra.

Before doing anything, inspect the existing repository structure, AGENTS.md, relevant project documentation, and .gitignore. Follow the repository's established conventions and avoid overwriting existing work.

## TASK 1 — Audit the downloaded datasets

Inspect the files already present in:
ml/training/data/raw/

If the directory does not exist or is empty, do not download or fabricate any datasets. Report that clearly.

For each dataset, generate a structured audit covering:
1. File name, format, file size, row count, and column count.
2. Column names, inferred data types, and short explanations where reasonably inferable.
3. Missing values per column, duplicate rows, and suspicious or inconsistent values.
4. Target information: residential sale price or monthly rent; currency and units; asking/listing vs actual registered transaction prices, if supported by the data.
5. Geographic coverage, Pune locality coverage, other cities mixed in, and locality normalization needs.
6. Potential leakage, outliers, inconsistent units, and data-quality risks.
7. Provenance, source URL, license, usage restrictions, and collection date where available. Never guess; mark unknowns unverified.
8. Suitability for Estora's sale-price model, rental-price model, or neither.
9. Recommended next steps and limitations.

Keep sale and rental datasets separate. Do not assume suitability from filenames alone.

## TASK 2 — Create audit deliverables

Save the report at docs/data/dataset_audit_report.md.
Create or update ml/training/data/README.md documenting local directory structure, provenance recording, and how to rerun the audit.

If useful, implement a reproducible audit script at ml/training/scripts/audit_datasets.py, following existing conventions. Document missing dependencies rather than silently changing unrelated configuration.

The script should support CSV, JSON, XLSX, and XLS where dependencies permit; inspect only actual raw files; never modify, rename, delete, or overwrite originals; avoid exposing row-level sensitive information; continue after unreadable files; produce repeatable results; and never train models or perform destructive operations.

## TASK 3 — Protect the repository

Ensure .gitignore ignores ml/training/data/raw/, ml/training/data/interim/, and ml/training/data/processed/. Do not delete, untrack, or rewrite files or Git history. If datasets are already tracked, report that and ask before acting. Do not commit or push anything. Keep raw data, credentials, personal information, and private records out of the report.

## TASK 4 — Automatically save every prompt

Inspect whether a prompt-saving workflow already exists and reuse it if possible. Use a dedicated prompts/ folder with a README and sensible categories such as dataset-audit/, frontend/, backend/, ml/, and architecture/.

Save the exact text of each new task prompt I give Antigravity as Markdown, with meaningful filenames and timestamps or sequence numbers where useful. Preserve wording; do not save responses, full conversations, logs, or general chat. Avoid duplicates. Do not save secrets, credentials, tokens, or sensitive personal information; warn me if a prompt appears to contain them.

Explain honestly how automatic capture works. Do not claim future prompts will be captured automatically unless a supported hook, workflow, or integration has actually been configured and tested. If Antigravity cannot access its own submitted prompt text, implement the closest reliable supported workflow, such as a reusable prompt-saving command or documented step, and explain what still requires my action. Save this current prompt as the first entry in prompts/.

## TASK 5 — Verify and summarize

Run the audit if feasible. Verify the report and README exist, raw files remain unchanged, .gitignore has the entries, and the prompt-saving workflow works as far as the environment permits. List every file created or modified, summarize real findings and dataset suitability, and state whether prompt capture is automatic or requires manual action.

Do not train models, build inference APIs, change frontend/backend functionality, commit, or push. Keep changes focused and consistent with Estora's architecture.
