import { CallProviderAdapter, NoteGenerationProvider, TranscriptionProvider } from '../shared-types/interfaces.js';
import { InMemoryRepository } from '../storage/repository.js';
import { CallSession, StructuredNote } from '../shared-types/types.js';

export class CallMonitorService {
  private activeSessions = new Map<string, CallSession>();
  constructor(
    private adapter: CallProviderAdapter,
    private transcription: TranscriptionProvider,
    private noteGenerator: NoteGenerationProvider,
    private repo: InMemoryRepository,
    private outboundMode: 'off' | 'ask' | 'auto' = 'auto'
  ) {}

  wire(): void {
    this.adapter.onIncomingCall((s) => this.activeSessions.set(s.callId, s));
    this.adapter.onOutgoingCall((s) => this.activeSessions.set(s.callId, s));
    this.adapter.onCallConnected((s) => {
      if (s.direction === 'inbound') this.activeSessions.set(s.callId, s);
      if (s.direction === 'outbound' && this.outboundMode === 'auto') this.activeSessions.set(s.callId, s);
    });
    this.adapter.onCallEnded((s) => void this.finalizeSession(s));
  }

  private async finalizeSession(session: CallSession): Promise<void> {
    const started = this.activeSessions.get(session.callId);
    if (!started) return;
    const endedAt = session.endedAt ?? new Date();
    const transcript = await this.transcription.transcribe(session.callId);
    const generated = await this.noteGenerator.generateNotes({
      transcript,
      metadata: { callId: session.callId, direction: session.direction, startedAt: started.startedAt.toISOString(), endedAt: endedAt.toISOString(), participants: [] },
      template: 'default',
      preferences: {}
    });
    const note: StructuredNote = {
      callId: session.callId,
      direction: session.direction,
      startedAt: started.startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      durationSeconds: Math.max(1, Math.round((endedAt.getTime() - started.startedAt.getTime()) / 1000)),
      participants: [],
      transcript,
      notes: generated.structured,
      status: 'draft',
      source: { provider: 'mock', callingApp: 'mock' }
    };
    this.repo.save(note);
    this.activeSessions.delete(session.callId);
  }
}
