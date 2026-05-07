import { TranscriptionProvider } from '../shared-types/interfaces.js';
import { TranscriptLine } from '../shared-types/types.js';
import { sampleTranscript } from '../samples/sampleTranscript.js';

export class MockTranscriptionProvider implements TranscriptionProvider {
  name = 'mock';
  supportsStreaming = false;
  supportsDiarization = true;
  async transcribe(_callId: string): Promise<TranscriptLine[]> { return sampleTranscript; }
}

export class LocalFileTranscriptionProvider implements TranscriptionProvider {
  name = 'local-file';
  supportsStreaming = false;
  supportsDiarization = false;
  async transcribe(_callId: string): Promise<TranscriptLine[]> { return sampleTranscript; }
}

export class CloudTranscriptionProvider implements TranscriptionProvider {
  name = 'cloud-placeholder';
  supportsStreaming = true;
  supportsDiarization = true;
  async transcribe(_callId: string): Promise<TranscriptLine[]> { throw new Error('Configure cloud credentials and SDK implementation.'); }
}
