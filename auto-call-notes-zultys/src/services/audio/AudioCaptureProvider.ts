export type CaptureMode = 'microphone-only' | 'system-audio' | 'dual-capture';

export type AudioChunkHandler = (chunk: Blob) => void;

export interface AudioCaptureProvider {
  getInputDevices(): Promise<MediaDeviceInfo[]>;
  start(options: {
    deviceId?: string;
    mode: CaptureMode;
    onChunk: AudioChunkHandler;
  }): Promise<void>;
  stop(): Promise<void>;
}
