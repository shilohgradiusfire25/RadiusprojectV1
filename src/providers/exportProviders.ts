import { writeFile } from 'node:fs/promises';
import { ExportProvider } from '../shared-types/interfaces.js';
import { StructuredNote } from '../shared-types/types.js';

export class JsonExportProvider implements ExportProvider {
  name = 'json';
  async exportNote(note: StructuredNote): Promise<void> { await writeFile(`./exports/${note.callId}.json`, JSON.stringify(note, null, 2)); }
}
