# Real Call Pilot Mode (Windows)

## Scope
This pilot introduces manual start/stop real-call note capture for Windows while preserving the static mock demo.

## How it works
1. User answers a Zultys ZAC call.
2. User opens **Real Call Test** and clicks **Start real call notes**.
3. App captures microphone audio in pilot mode.
4. Optional system/dual capture modes are exposed; WASAPI loopback is currently a placeholder provider.
5. Audio chunks stream to the transcription provider via Electron preload/main IPC.
6. Live transcript is shown in the UI.
7. User clicks **Stop real call notes**.
8. Structured notes are generated.
9. Employee must click **Review** before export is enabled.

## Security and secrets
- Browser code does not store API keys.
- Real provider secrets are intended to stay in Electron main/backend environment variables.

## Config
Use `.env.example` values:
- `TRANSCRIPTION_PROVIDER`
- `OPENAI_API_KEY`
- `OPENAI_TRANSCRIPTION_MODEL`
- `NOTE_GENERATION_PROVIDER`
- `OPENAI_NOTES_MODEL`
- `AUDIO_CAPTURE_MODE`

## Next integration step
`ZultysZacAdapter` is reserved for future Flex/Data Connect/official Zultys integration events after manual pilot validation.
