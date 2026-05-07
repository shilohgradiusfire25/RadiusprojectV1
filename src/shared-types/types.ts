export type CallState =
  | 'idle'
  | 'incoming_ringing'
  | 'outgoing_dialing'
  | 'answered'
  | 'connected'
  | 'on_hold'
  | 'ended'
  | 'missed'
  | 'failed';

export type CallDirection = 'inbound' | 'outbound';

export interface Participant {
  name: string;
  phone: string;
  role: 'employee' | 'customer' | 'unknown';
}

export interface TranscriptLine {
  speaker: string;
  startTime: number;
  endTime: number;
  text: string;
}

export interface StructuredNote {
  callId: string;
  direction: CallDirection;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  participants: Participant[];
  transcript: TranscriptLine[];
  notes: {
    summary: string;
    keyPoints: string[];
    customerIntent: string;
    questionsAsked: string[];
    answersGiven: string[];
    actionItems: { task: string; owner: string; dueDate: string | null }[];
    followUp: { required: boolean; owner: string | null; deadline: string | null; recommendedMessage: string | null };
    sentiment: 'positive' | 'neutral' | 'negative' | 'mixed' | 'unknown';
    urgency: 'low' | 'medium' | 'high' | 'unknown';
    outcome: string;
    risks: string[];
    recommendedNextStep: string;
  };
  status: 'draft' | 'reviewed' | 'exported' | 'deleted';
  source: { provider: string; callingApp: string };
}

export interface CallSession {
  callId: string;
  direction: CallDirection;
  state: CallState;
  startedAt: Date;
  endedAt?: Date;
  caller?: Participant;
}
