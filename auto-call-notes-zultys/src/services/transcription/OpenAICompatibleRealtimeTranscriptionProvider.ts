import type { TranscriptionProvider } from './TranscriptionProvider';

declare global {
  interface Window {
    desktopBridge?: {
      transcriptionStart: (callId: string) => Promise<void>;
      transcriptionChunk: (base64Audio: string) => Promise<void>;
      transcriptionStop: () => Promise<string[]>;
    };
  }
}

export class OpenAICompatibleRealtimeTranscriptionProvider implements TranscriptionProvider {
  async transcribe(callId: string) {
    return [`OpenAI-compatible provider is configured for realtime mode only (${callId}).`];
  }

  async startRealtimeSession(callId: string, onTranscript: (line: string) => void) {
    onTranscript(`[${new Date().toISOString()}] Realtime transcription session started.`);
    if (!window.desktopBridge) {
      throw new Error('Desktop bridge is unavailable. Run in Electron for real transcription.');
    }
    await window.desktopBridge.transcriptionStart(callId);
  }

  async pushAudioChunk(chunk: Blob) {
    if (!window.desktopBridge) return;
    const bytes = new Uint8Array(await chunk.arrayBuffer());
    const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
    await window.desktopBridge.transcriptionChunk(btoa(binary));
  }

  async stopRealtimeSession() {
    if (!window.desktopBridge) return ['No desktop bridge session.'];
    return window.desktopBridge.transcriptionStop();
  }
}
