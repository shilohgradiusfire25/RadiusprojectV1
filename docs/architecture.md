# AutoCall Notes Architecture

Modules:
- app-shell: runtime entry and lifecycle (currently `src/main.ts`)
- call-monitor: orchestrates call event -> transcript -> notes -> storage
- call-provider-adapters: mock, manual, desktop detection placeholder, webhook placeholder
- transcription: provider interface and mock/local/cloud placeholders
- note-generation: provider interface and default factual prompt
- storage: repository abstraction (in-memory MVP, encrypted DB planned)
- export: provider abstraction for JSON/Markdown/PDF/CRM extensions
- settings/audit/security: documented requirements and extension points

Safety defaults:
- No pre-answer capture logic.
- Call integration placeholders throw until explicitly configured.
- Outbound mode configurable (`off|ask|auto`).
