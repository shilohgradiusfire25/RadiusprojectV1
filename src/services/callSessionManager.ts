import { AudioCaptureProvider, AuditLogRepository, CallProviderAdapter, CRMExportProvider, NoteGenerationProvider, SettingsRepository, TranscriptionProvider } from '../shared-types/interfaces.js';
import { CallMetadata, StructuredNote, TranscriptSegment } from '../shared-types/types.js';

export class CallSessionManager {
  private activeCall: CallMetadata | null = null;
  private sessionId: string | null = null;
  private segments: TranscriptSegment[] = [];
  private dedupe = new Set<string>();
  constructor(
    private callProvider: CallProviderAdapter,
    private audio: AudioCaptureProvider,
    private transcription: TranscriptionProvider,
    private notes: NoteGenerationProvider,
    private exports: CRMExportProvider,
    private settingsRepo: SettingsRepository,
    private audit: AuditLogRepository,
  ) {}

  async initialize(): Promise<void> {
    await this.callProvider.initialize(); await this.audio.initialize(); await this.transcription.initialize();
    this.transcription.onFinalTranscript((s) => this.segments.push(s));
    this.callProvider.onIncomingCall((c) => this.onIncoming(c));
    this.callProvider.onOutgoingCall((c) => this.onOutgoing(c));
    this.callProvider.onCallConnected((c) => this.onConnected(c));
    this.callProvider.onCallEnded((c) => this.onEnded(c));
  }

  private key(c: CallMetadata, event: string): string { return `${c.callId}:${event}:${c.state}`; }
  private async onIncoming(call: CallMetadata): Promise<void> { this.activeCall = call; await this.audit.log('incoming_ringing', { callId: call.callId }); }
  private async onOutgoing(call: CallMetadata): Promise<void> { this.activeCall = call; await this.audit.log('outgoing_dialing', { callId: call.callId }); }

  private async onConnected(call: CallMetadata): Promise<void> {
    if (this.dedupe.has(this.key(call, 'connected'))) return;
    this.dedupe.add(this.key(call, 'connected'));
    const policy = await this.settingsRepo.getPolicy();
    const shouldStart = call.direction === 'inbound' ? policy.autoInboundNotesEnabled : policy.outboundBehavior === 'auto_start';
    if (!shouldStart) return;
    this.activeCall = call;
    await this.audio.startCapture(call.callId, { mode: 'mock' });
    this.sessionId = await this.transcription.startStreamingSession(call);
    await this.audit.log('note_session_started', { callId: call.callId, visibleIndicator: true });
  }

  private async onEnded(call: CallMetadata): Promise<void> {
    if (!this.sessionId || !this.activeCall) return;
    await this.audio.stopCapture(call.callId);
    await this.transcription.stopStreamingSession(this.sessionId);
    const note = await this.notes.generateNotes(call, this.segments, 'default', '');
    note.status = 'pending_review';
    await this.audit.log('note_generated', { callId: call.callId, noteId: note.noteId, status: note.status });
  }

  async exportReviewed(note: StructuredNote): Promise<void> {
    const policy = await this.settingsRepo.getPolicy();
    if (policy.requireReviewBeforeExport && !note.review.reviewedAt) throw new Error('Review required before export');
    await this.exports.createOrUpdateCallActivity(note);
    if (policy.allowTranscriptExport) await this.exports.attachTranscript(note);
    await this.audit.log('note_exported', { noteId: note.noteId });
  }
}
