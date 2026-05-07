import { BaseCallAdapter } from './baseAdapter.js';
export class ManualCallProviderAdapter extends BaseCallAdapter { getCapabilities(): string[] { return ['manual-start-stop']; } }
