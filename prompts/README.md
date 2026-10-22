# Estora — Task Prompts Repository

This directory archives task prompts given to Antigravity across project development workflows. Storing prompt history ensures architectural traceability, repeatable testing, and clear prompt provenance across versions.

---

## Directory Structure

```text
prompts/
├── README.md               # Directory guide and capture protocol
├── dataset-audit/          # Data audit, cleaning, EDA, and ingestion task prompts
├── frontend/               # UI/UX, components, Next.js, and design token prompts
├── backend/                # FastAPI, Pydantic, services, database, and auth prompts
├── ml/                     # ML modeling, feature engineering, evaluation, and inference prompts
└── architecture/           # System design, ADRs, PRD/SRS refinement, and DevOps prompts
```

---

## Prompt Capture Protocol

### File Naming Convention
Prompts are recorded as standalone Markdown files within their respective category folder:
`prompts/<category>/<sequence-number>_<meaningful-slug>.md`

Example:
`prompts/dataset-audit/001_dataset_audit_initial_prompt.md`

### File Format & Structure
Each prompt file stores:
- **Metadata**: Date & Time (UTC/Local), Category, Status, Scope.
- **Exact Prompt Content**: Unaltered, verbatim prompt text without agent commentary, conversational fluff, or execution logs.

### Security & Sanitization Rules
- **No Credentials or Secrets**: Never record API keys, database credentials, JWT secrets, passwords, or `.env` entries. If a user prompt contains a credential, replace it with `[REDACTED_SECRET]` and notify the user immediately.
- **No Private Data**: Avoid logging personal phone numbers, emails, or personal identification records.
- **No Conversational Noise**: Greetings ("hii", "bye"), quick status checks, or responses are excluded; only goal-driven task prompts are archived.

---

## How Prompt Capture Works in Antigravity

### Transparency Notice on Automation
1. **Agent Turn Capture (Active Protocol)**:
   Antigravity does not have an external, silent daemon that writes to the filesystem before the agent executes. Instead, on every new task prompt passed to the agent inside `<USER_REQUEST>`, the agent autonomously preserves and writes the verbatim prompt into the corresponding `prompts/<category>/` directory before executing the changes.
2. **Reusable CLI Script (`scripts/save_prompt.py`)**:
   A lightweight command-line script is provided to allow saving prompts either manually or via a pre-invocation pipeline:
   ```bash
   python scripts/save_prompt.py --category <category> --title "<short_title>" --file "<path_to_prompt_txt>"
   ```
3. **What Requires User Action**:
   - The user provides prompts via the chat interface as normal.
   - If a prompt contains sensitive tokens or keys, the user is warned to sanitize them before logging.
