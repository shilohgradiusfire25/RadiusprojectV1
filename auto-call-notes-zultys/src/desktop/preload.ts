import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('desktopBridge', {
  transcriptionStart: (callId: string) => ipcRenderer.invoke('transcription:start', callId),
  transcriptionChunk: (base64Audio: string) => ipcRenderer.invoke('transcription:chunk', base64Audio),
  transcriptionStop: () => ipcRenderer.invoke('transcription:stop')
});
