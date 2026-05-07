import { mkdir } from 'node:fs/promises';
import { MockCallProviderAdapter } from './adapters/mockCallProviderAdapter.js';
import { MockNoteGenerationProvider } from './providers/noteGenerationProviders.js';
import { MockTranscriptionProvider } from './providers/transcriptionProviders.js';
import { CallMonitorService } from './services/callMonitorService.js';
import { InMemoryRepository } from './storage/repository.js';

async function runDemo() {
  await mkdir('./exports', { recursive: true });
  const adapter = new MockCallProviderAdapter();
  const repo = new InMemoryRepository();
  const monitor = new CallMonitorService(adapter, new MockTranscriptionProvider(), new MockNoteGenerationProvider(), repo, 'auto');
  monitor.wire();

  const inbound = adapter.simulateIncoming();
  adapter.simulateAnswer(inbound);
  adapter.simulateEnd(inbound);

  await new Promise((r) => setTimeout(r, 10));
  console.log('AutoCall Notes MVP complete. Draft notes count:', repo.getAll().length);
}

runDemo().catch((e) => {
  console.error('Fatal startup error', e);
  process.exit(1);
});
