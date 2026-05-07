import type { AudioCaptureProvider, CaptureMode } from './AudioCaptureProvider';

export class BrowserMicrophoneCaptureProvider implements AudioCaptureProvider {
  private recorder?: MediaRecorder;
  private stream?: MediaStream;

  async getInputDevices() {
    if (!navigator?.mediaDevices?.enumerateDevices) return [];
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(d => d.kind === 'audioinput');
  }

  async start({ deviceId, mode, onChunk }: { deviceId?: string; mode: CaptureMode; onChunk: (chunk: Blob) => void }) {
    if (mode !== 'microphone-only') {
      throw new Error('Browser mode supports microphone-only capture in this pilot.');
    }
    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: deviceId ? { deviceId: { exact: deviceId } } : true
    });
    this.recorder = new MediaRecorder(this.stream, { mimeType: 'audio/webm' });
    this.recorder.addEventListener('dataavailable', event => {
      if (event.data.size > 0) onChunk(event.data);
    });
    this.recorder.start(1000);
  }

  async stop() {
    this.recorder?.stop();
    this.stream?.getTracks().forEach(t => t.stop());
  }
}
