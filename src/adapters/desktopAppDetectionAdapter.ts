import { BaseCallAdapter } from './baseAdapter.js';

export class DesktopAppDetectionAdapter extends BaseCallAdapter {
  getCapabilities(): string[] { return ['process-detection-disabled-by-default']; }
  async initialize(): Promise<void> {
    throw new Error('DesktopAppDetectionAdapter is a placeholder. Enable explicitly and implement official API mapping first.');
  }
}
