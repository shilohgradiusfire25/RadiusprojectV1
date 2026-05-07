export class MockTranscriptionProvider {
  async transcribe(callId: string) {
    return [`[${new Date().toISOString()}] Mock transcript for ${callId}`, 'Customer asked for pricing.', 'Agent committed follow-up email.'];
  }
}
