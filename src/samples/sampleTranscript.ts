import { TranscriptLine } from '../shared-types/types.js';

export const sampleTranscript: TranscriptLine[] = [
  { speaker: 'Customer', startTime: 0, endTime: 5, text: 'Hi, I wanted to ask about your pricing tiers?' },
  { speaker: 'Employee', startTime: 5, endTime: 12, text: 'Absolutely, we have monthly and annual plans with trial options.' },
  { speaker: 'Customer', startTime: 12, endTime: 18, text: 'Can you send a quote and suggest a demo time next week?' }
];
