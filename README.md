# AutoCall Notes (MVP Scaffold)

## 1) Brief architecture plan
- Event-driven call monitor service subscribes to `CallProviderAdapter` lifecycle events.
- Note sessions start only on `answered/connected` and stop on `ended`.
- `TranscriptionProvider` and `NoteGenerationProvider` are pluggable.
- Repository abstraction isolates storage from business logic.
- Export providers are modular.

## 2) Chosen stack
- TypeScript (strict mode)
- Node runtime for MVP orchestration
- Vitest unit tests
- Adapter/provider architecture aligned to future Electron/Tauri desktop shell

## 3) Assumptions
- Initial local MVP uses mock call + mock transcript + mock note generation.
- External integrations (real calling app, cloud transcription, CRM) are placeholders.
- Security-sensitive persistence is documented; encrypted DB + OS credential store are next implementation phase.

## 4) File plan created
- `src/shared-types/*`: schema and interfaces
- `src/adapters/*`: call provider adapters
- `src/providers/*`: transcription, note generation, export providers
- `src/services/callMonitorService.ts`: orchestration
- `src/storage/repository.ts`: persistence abstraction (in-memory MVP)
- `src/main.ts`: runnable MVP simulation
- `tests/*`: core lifecycle test
- `docs/architecture.md`, `.env.example`

## Run
```bash
npm install
npm run dev
```

## Test
```bash
npm test
```

## MVP flows
### Inbound auto-notes
1. Mock adapter emits incoming ringing.
2. On answer/connected, session becomes active.
3. On call end, transcript is generated via provider.
4. Notes are structured and saved as draft.

### Outbound auto-notes
Set `OUTBOUND_MODE=auto`. On outbound connect, active session starts and finalizes on end.

### Manual fallback
Use `ManualCallProviderAdapter` and invoke start/stop from UI shell (to be wired in desktop UI layer).

## Real desktop calling app integration
Implement a new adapter by extending `BaseCallAdapter` and mapping external events:
- incoming
- outgoing
- answered
- connected
- ended
- failed

Use official APIs/webhooks first. Keep OS-level process/window detection disabled by default and only opt-in with explicit admin configuration.

## Compliance and privacy notes
- No hidden recording behavior.
- No pre-answer capture.
- Explicit consent/compliance messaging expected in settings.
- Respect OS permissions; do not bypass app security controls.
- Add encrypted local DB and OS credential vault before production use.
- Add retention/deletion jobs and audit log persistence before production use.

## Known limitations
- This repository currently provides production-oriented core architecture and working mock MVP flow, not a full Electron UI shell yet.
- Storage is in-memory for MVP testability.
- Cloud transcription and CRM export are placeholders.

## Next production steps
1. Add Electron/Tauri app shell with tray icon and screens (dashboard, settings, history, note detail).
2. Implement SQLCipher (or equivalent) encrypted storage layer.
3. Add OS secure credential store integration (Keychain/Credential Manager/libsecret).
4. Implement real call adapter for your chosen calling app SDK/webhook.
5. Add redaction pipeline + retention scheduler + full audit logging.
