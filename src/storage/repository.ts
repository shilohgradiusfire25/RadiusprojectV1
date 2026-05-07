import { StructuredNote } from '../shared-types/types.js';

export class InMemoryRepository {
  private notes = new Map<string, StructuredNote>();
  save(note: StructuredNote): void { this.notes.set(note.callId, note); }
  getAll(): StructuredNote[] { return [...this.notes.values()]; }
  getById(callId: string): StructuredNote | undefined { return this.notes.get(callId); }
}
