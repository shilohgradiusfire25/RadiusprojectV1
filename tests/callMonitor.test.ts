import { describe, expect, it } from 'vitest';
import { MockCallProviderAdapter } from '../src/adapters/mockCallProviderAdapter.js';
import { MockNoteGenerationProvider } from '../src/providers/noteGenerationProviders.js';
import { MockTranscriptionProvider } from '../src/providers/transcriptionProviders.js';
import { CallMonitorService } from '../src/services/callMonitorService.js';
import { InMemoryRepository } from '../src/storage/repository.js';

describe('CallMonitorService', () => {
  it('creates draft note after inbound answer and end', async () => {
    const adapter = new MockCallProviderAdapter();
    const repo = new InMemoryRepository();
    const svc = new CallMonitorService(adapter, new MockTranscriptionProvider(), new MockNoteGenerationProvider(), repo, 'auto');
    svc.wire();
    const call = adapter.simulateIncoming();
    adapter.simulateAnswer(call);
    adapter.simulateEnd(call);
    await new Promise((r) => setTimeout(r, 20));
    expect(repo.getAll()).toHaveLength(1);
    expect(repo.getAll()[0].status).toBe('draft');
  });
});
