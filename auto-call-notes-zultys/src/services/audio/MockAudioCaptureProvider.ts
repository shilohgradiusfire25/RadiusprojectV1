import type { AudioCaptureProvider, CaptureMode } from './AudioCaptureProvider';

export class MockAudioCaptureProvider implements AudioCaptureProvider {
  async getInputDevices() {
    return [];
  }

  async start({ mode, onChunk }: { deviceId?: string; mode: CaptureMode; onChunk: (chunk: Blob) => void }) {
    const payload = new Blob([`mock-audio-${mode}`], { type: 'text/plain' });
    onChunk(payload);
  }

  async stop() {
    return;
  }
}
