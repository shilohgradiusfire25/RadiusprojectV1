export class MockNoteGenerationProvider {
  async generate(lines: string[]) {
    return `Summary:\n- ${lines.slice(0,2).join('\n- ')}\n\nAction Items:\n- Send pricing follow-up\n- Schedule next call`;
  }
}
