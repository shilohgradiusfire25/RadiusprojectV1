import type { CallProviderAdapter } from './CallProviderAdapter';

export class ZultysZacAdapter implements CallProviderAdapter {
  simulateInbound() {
    return `zac-future-inbound-${Date.now()}`;
  }

  simulateOutbound() {
    return `zac-future-outbound-${Date.now()}`;
  }

  // Placeholder: future official integration event handlers
  handleFlexEvent(_payload: unknown) {}
  handleDataConnectEvent(_payload: unknown) {}
  handleOfficialApiEvent(_payload: unknown) {}
}
