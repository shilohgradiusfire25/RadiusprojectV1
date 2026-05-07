import { BaseCallAdapter } from './baseAdapter.js';
import { CallSession } from '../shared-types/types.js';

export class MockCallProviderAdapter extends BaseCallAdapter {
  getCapabilities(): string[] { return ['simulate-inbound', 'simulate-outbound', 'lifecycle']; }

  simulateIncoming(): CallSession {
    const session: CallSession = { callId: crypto.randomUUID(), direction: 'inbound', state: 'incoming_ringing', startedAt: new Date() };
    this.state = 'incoming_ringing'; this.direction = 'inbound'; this.emit('incoming', session); return session;
  }
  simulateAnswer(session: CallSession): void { this.state = 'connected'; this.emit('answered', { ...session, state: 'answered' }); this.emit('connected', { ...session, state: 'connected' }); }
  simulateOutbound(): CallSession {
    const session: CallSession = { callId: crypto.randomUUID(), direction: 'outbound', state: 'outgoing_dialing', startedAt: new Date() };
    this.state = 'outgoing_dialing'; this.direction = 'outbound'; this.emit('outgoing', session); return session;
  }
  simulateConnect(session: CallSession): void { this.state = 'connected'; this.emit('connected', { ...session, state: 'connected' }); }
  simulateEnd(session: CallSession): void { this.state = 'ended'; this.emit('ended', { ...session, endedAt: new Date(), state: 'ended' }); this.state = 'idle'; }
}
