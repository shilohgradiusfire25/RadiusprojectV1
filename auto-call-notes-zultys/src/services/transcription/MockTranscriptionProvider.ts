import type { TranscriptionProvider } from './TranscriptionProvider';

export class MockTranscriptionProvider implements TranscriptionProvider {
  private lines: string[] = [];

  async transcribe(callId: string) {
    return [`[${new Date().toISOString()}] Mock transcript for ${callId}`, 'Customer asked for pricing.', 'Agent committed follow-up email.'];
  }

  async startRealtimeSession(callId: string, onTranscript: (line: string) => void) {
    this.lines = [`[${new Date().toISOString()}] Real-call pilot started for ${callId}`];
    this.lines.forEach(onTranscript);
  }

  async pushAudioChunk(_: Blob) {
    const line = `[${new Date().toISOString()}] Mock realtime chunk processed.`;
    this.lines.push(line);
  }

  async stopRealtimeSession() {
    this.lines.push('Call completed.');
    return this.lines;
  }
}
