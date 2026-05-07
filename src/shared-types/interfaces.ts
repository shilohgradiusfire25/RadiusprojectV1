import { AdminPolicy, CallMetadata, CallState, StructuredNote, TranscriptSegment } from './types.js';

export interface CallProviderAdapter {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;
  getCapabilities(): string[];
  getCurrentCallState(): CallState;
  getCurrentCallMetadata(): CallMetadata | null;
  onIncomingCall(callback: (call: CallMetadata) => void): void;
  onOutgoingCall(callback: (call: CallMetadata) => void): void;
  onCallRinging(callback: (call: CallMetadata) => void): void;
  onCallAnswered(callback: (call: CallMetadata) => void): void;
  onCallConnected(callback: (call: CallMetadata) => void): void;
  onCallHeld(callback: (call: CallMetadata) => void): void;
  onCallResumed(callback: (call: CallMetadata) => void): void;
  onCallEnded(callback: (call: CallMetadata) => void): void;
  onCallFailed(callback: (call: CallMetadata, error: string) => void): void;
}

export interface AudioCaptureProvider {
  initialize(): Promise<void>; requestPermissions(): Promise<boolean>;
  listInputDevices(): Promise<string[]>; listOutputDevices(): Promise<string[]>;
  startCapture(callId: string, options: Record<string, unknown>): Promise<void>;
  stopCapture(callId: string): Promise<void>; pauseCapture(callId: string): Promise<void>; resumeCapture(callId: string): Promise<void>;
  getCaptureStatus(callId: string): 'idle'|'capturing'|'paused'|'failed';
}

export interface TranscriptionProvider {
  initialize(): Promise<void>;
  startStreamingSession(callMetadata: CallMetadata): Promise<string>;
  sendAudioChunk(sessionId: string, audioChunk: Buffer): Promise<void>;
  onPartialTranscript(callback: (segment: TranscriptSegment) => void): void;
  onFinalTranscript(callback: (segment: TranscriptSegment) => void): void;
  stopStreamingSession(sessionId: string): Promise<void>;
  transcribeFile(filePath: string, metadata: CallMetadata): Promise<TranscriptSegment[]>;
  getCapabilities(): string[];
}

export interface NoteGenerationProvider {
  initialize(): Promise<void>;
  generateNotes(callMetadata: CallMetadata, transcriptSegments: TranscriptSegment[], noteTemplate: string, companyContext: string): Promise<StructuredNote>;
  regenerateNotes(noteId: string, editedTranscript: TranscriptSegment[], instructions: string): Promise<StructuredNote>;
  summarizeLive(transcriptSegments: TranscriptSegment[]): Promise<string>;
  getCapabilities(): string[];
}

export interface CRMExportProvider {
  initialize(): Promise<void>; testConnection(): Promise<boolean>;
  searchContactByPhone(phone: string): Promise<string | null>;
  createOrUpdateCallActivity(note: StructuredNote): Promise<string>;
  attachTranscript(note: StructuredNote): Promise<void>;
  attachRecordingReference(note: StructuredNote): Promise<void>;
  updateCRMObject(note: StructuredNote): Promise<void>;
  getCapabilities(): string[];
}

export interface AuditLogRepository { log(event: string, payload: Record<string, unknown>): Promise<void>; }
export interface SettingsRepository { getPolicy(): Promise<AdminPolicy>; savePolicy(policy: AdminPolicy): Promise<void>; }
