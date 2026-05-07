import { BaseCallAdapter } from './baseAdapter.js';

export class ApiWebhookCallProviderAdapter extends BaseCallAdapter {
  getCapabilities(): string[] { return ['webhook-placeholder']; }
  async initialize(): Promise<void> {
    throw new Error('ApiWebhookCallProviderAdapter placeholder. Implement provider-specific webhook/API integration.');
  }
}
