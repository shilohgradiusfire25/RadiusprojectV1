import { NoteGenerationProvider } from '../shared-types/interfaces.js';

export const DEFAULT_PROMPT = `You are an assistant that creates accurate business call notes from transcripts. Use only the transcript and metadata provided. Do not invent missing details. If information is unavailable, write 'Unknown'. Extract concise notes that an employee can review before saving. Return valid JSON matching the required schema.`;

export class MockNoteGenerationProvider implements NoteGenerationProvider {
  name = 'mock-notes';
  async generateNotes(input: Parameters<NoteGenerationProvider['generateNotes']>[0]) {
    const textBlob = input.transcript.map((l) => l.text).join(' ');
    return {
      structured: {
        summary: 'Customer asked for pricing and next-step demo scheduling.',
        keyPoints: ['Pricing discussed', 'Demo requested'],
        customerIntent: 'Evaluate product fit and pricing',
        questionsAsked: input.transcript.filter((x) => x.text.includes('?')).map((x) => x.text),
        answersGiven: ['Agent explained standard plan and trial options'],
        actionItems: [{ task: 'Send pricing sheet', owner: 'employee', dueDate: null }],
        followUp: { required: true, owner: 'employee', deadline: null, recommendedMessage: 'Share pricing sheet and demo slots.' },
        sentiment: 'neutral', urgency: 'medium', outcome: 'Open opportunity', risks: textBlob.includes('budget') ? ['Budget sensitivity'] : [],
        recommendedNextStep: 'Email pricing and schedule demo'
      },
      text: 'Summary: Customer requested pricing and a follow-up demo. Action: send pricing and schedule demo.'
    };
  }
}
