import type { AudioCaptureProvider, CaptureMode } from './AudioCaptureProvider';

export class WindowsWasapiLoopbackCaptureProvider implements AudioCaptureProvider {
  async getInputDevices() {
    return [];
  }

  async start({ mode }: { deviceId?: string; mode: CaptureMode; onChunk: (chunk: Blob) => void }) {
    throw new Error(`WASAPI loopback capture is not implemented yet for mode: ${mode}.`);
  }

  async stop() {
    return;
  }
}
