import { MockCallProviderAdapter } from '../call-providers/MockCallProviderAdapter';
import { MockAudioCaptureProvider } from '../audio/MockAudioCaptureProvider';
import { MockTranscriptionProvider } from '../transcription/MockTranscriptionProvider';
import { MockNoteGenerationProvider } from '../notes/MockNoteGenerationProvider';
import { MockCRMExportProvider } from '../crm/MockCRMExportProvider';

export const providerRegistry = {
  call: new MockCallProviderAdapter(),
  audio: new MockAudioCaptureProvider(),
  transcription: new MockTranscriptionProvider(),
  notes: new MockNoteGenerationProvider(),
  crm: new MockCRMExportProvider()
};
