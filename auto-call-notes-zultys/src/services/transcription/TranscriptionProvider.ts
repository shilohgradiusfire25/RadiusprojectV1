export interface TranscriptionProvider {
  transcribe(callId: string): Promise<string[]>;
  startRealtimeSession(callId: string, onTranscript: (line: string) => void): Promise<void>;
  pushAudioChunk(chunk: Blob): Promise<void>;
  stopRealtimeSession(): Promise<string[]>;
}
