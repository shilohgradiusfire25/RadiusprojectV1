import type { CallProviderAdapter } from './CallProviderAdapter';

export class MockCallProviderAdapter implements CallProviderAdapter {
  simulateInbound() { return `in-${Date.now()}`; }
  simulateOutbound() { return `out-${Date.now()}`; }
}
