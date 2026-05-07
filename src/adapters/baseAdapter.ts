import { EventEmitter } from 'node:events';
import { CallProviderAdapter } from '../shared-types/interfaces.js';
import { CallDirection, CallSession, CallState } from '../shared-types/types.js';

export abstract class BaseCallAdapter extends EventEmitter implements CallProviderAdapter {
  protected state: CallState = 'idle';
  protected direction: CallDirection | null = null;
  async initialize(): Promise<void> {}
  abstract getCapabilities(): string[];
  onIncomingCall(callback: (session: CallSession) => void): void { this.on('incoming', callback); }
  onOutgoingCall(callback: (session: CallSession) => void): void { this.on('outgoing', callback); }
  onCallAnswered(callback: (session: CallSession) => void): void { this.on('answered', callback); }
  onCallConnected(callback: (session: CallSession) => void): void { this.on('connected', callback); }
  onCallEnded(callback: (session: CallSession) => void): void { this.on('ended', callback); }
  onCallFailed(callback: (session: CallSession, error: string) => void): void { this.on('failed', callback); }
  getCurrentCallState(): CallState { return this.state; }
  getCallerInfo(): string | null { return null; }
  getCallDirection(): CallDirection | null { return this.direction; }
}
