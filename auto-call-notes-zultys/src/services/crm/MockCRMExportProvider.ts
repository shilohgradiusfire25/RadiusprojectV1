export class MockCRMExportProvider {
  async export(noteId: string) {
    return { exported: true, crmId: `mock-crm-${noteId}` };
  }
}
