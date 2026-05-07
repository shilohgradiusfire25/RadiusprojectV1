import { MockCallProviderAdapter } from '../call-providers/MockCallProviderAdapter';
import { MockAudioCaptureProvider } from '../audio/MockAudioCaptureProvider';
import { WindowsMicrophoneCaptureProvider } from '../audio/WindowsMicrophoneCaptureProvider';
import { MockTranscriptionProvider } from '../transcription/MockTranscriptionProvider';
import { OpenAICompatibleRealtimeTranscriptionProvider } from '../transcription/OpenAICompatibleRealtimeTranscriptionProvider';
import { MockNoteGenerationProvider } from '../notes/MockNoteGenerationProvider';
import { MockCRMExportProvider } from '../crm/MockCRMExportProvider';

const transcription = (import.meta.env.VITE_TRANSCRIPTION_PROVIDER || 'mock') === 'openai-compatible'
  ? new OpenAICompatibleRealtimeTranscriptionProvider()
  : new MockTranscriptionProvider();

const audio = (import.meta.env.VITE_AUDIO_CAPTURE_MODE || 'browser-mic') === 'windows-mic'
  ? new WindowsMicrophoneCaptureProvider()
  : new MockAudioCaptureProvider();

export const providerRegistry = {
  call: new MockCallProviderAdapter(),
  audio,
  transcription,
  notes: new MockNoteGenerationProvider(),
  crm: new MockCRMExportProvider()
};
