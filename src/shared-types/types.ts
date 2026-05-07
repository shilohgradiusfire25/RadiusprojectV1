export type CallState =
  | 'idle'
  | 'incoming_ringing'
  | 'outgoing_dialing'
  | 'connected'
  | 'held'
  | 'ended'
  | 'missed'
  | 'failed'
  | 'unknown';

export type CallDirection = 'inbound' | 'outbound' | 'internal' | 'unknown';
export type OutboundBehavior = 'off' | 'ask' | 'auto_start';
export type NoteStatus = 'draft' | 'pending_review' | 'reviewed' | 'exported' | 'deleted';

export interface CallMetadata {
  callId: string;
  direction: CallDirection;
  state: CallState;
  remoteName: string | null;
  remoteNumber: string | null;
  employeeExtension: string | null;
  employeeUserId: string | null;
  startedAt: string | null;
  connectedAt: string | null;
  endedAt: string | null;
  source: 'zultys-zac' | 'manual' | 'mock';
  rawProviderPayload: Record<string, unknown> | null;
}

export interface TranscriptSegment {
  id: string;
  callId: string;
  speaker: 'employee' | 'customer' | 'unknown';
  startTimeMs: number;
  endTimeMs: number;
  text: string;
  isFinal: boolean;
  confidence: number;
  source: 'live' | 'batch' | 'imported';
}

export interface StructuredNote {
  noteId: string;
  callId: string;
  status: NoteStatus;
  direction: CallDirection;
  startedAt: string;
  connectedAt: string | null;
  endedAt: string;
  durationSeconds: number;
  participants: Array<{ name: string | null; phone: string | null; role: 'employee' | 'customer' | 'unknown' }>;
  transcript: Array<{ speaker: 'employee' | 'customer' | 'unknown'; startTimeMs: number; endTimeMs: number; text: string }>;
  notes: Record<string, unknown>;
  review: { required: true; reviewedBy: string | null; reviewedAt: string | null; employeeEdits: boolean };
  crm: { exportStatus: 'not_exported' | 'exported' | 'failed'; crmProvider: string | null; crmObjectType: string; crmObjectId: string | null; lastExportedAt: string | null };
  source: { callingApp: 'Zultys ZAC'; callProvider: string; transcriptionProvider: string; noteProvider: string };
}

export interface AdminPolicy {
  autoInboundNotesEnabled: boolean;
  outboundAutoNotesEnabled: boolean;
  outboundBehavior: OutboundBehavior;
  requireReviewBeforeExport: boolean;
  allowManualTranscription: boolean;
  allowTranscriptExport: boolean;
}
