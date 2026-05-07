import { CallDirection, CallSession, CallState, StructuredNote, TranscriptLine } from './types.js';

export interface CallProviderAdapter {
  initialize(): Promise<void>;
  getCapabilities(): string[];
  onIncomingCall(callback: (session: CallSession) => void): void;
  onOutgoingCall(callback: (session: CallSession) => void): void;
  onCallAnswered(callback: (session: CallSession) => void): void;
  onCallConnected(callback: (session: CallSession) => void): void;
  onCallEnded(callback: (session: CallSession) => void): void;
  onCallFailed(callback: (session: CallSession, error: string) => void): void;
  getCurrentCallState(): CallState;
  getCallerInfo(): string | null;
  getCallDirection(): CallDirection | null;
}

export interface TranscriptionProvider {
  name: string;
  supportsStreaming: boolean;
  supportsDiarization: boolean;
  transcribe(callId: string): Promise<TranscriptLine[]>;
}

export interface NoteGenerationProvider {
  name: string;
  generateNotes(input: {
    transcript: TranscriptLine[];
    metadata: { callId: string; direction: CallDirection; startedAt: string; endedAt: string; participants: string[] };
    template: string;
    preferences: Record<string, string | boolean>;
  }): Promise<{ structured: Omit<StructuredNote, 'status' | 'source'>['notes']; text: string }>;
}

export interface ExportProvider {
  name: string;
  exportNote(note: StructuredNote): Promise<void>;
}
