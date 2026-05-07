export interface CallProviderAdapter {
  simulateInbound(): string;
  simulateOutbound(): string;
}
