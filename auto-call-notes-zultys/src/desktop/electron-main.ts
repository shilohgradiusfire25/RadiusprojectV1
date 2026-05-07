import { app, BrowserWindow, ipcMain } from 'electron';

let realtimeLines: string[] = [];

ipcMain.handle('transcription:start', async (_event, callId: string) => {
  realtimeLines = [`[${new Date().toISOString()}] Started realtime session for ${callId}`];
});

ipcMain.handle('transcription:chunk', async () => {
  const provider = process.env.TRANSCRIPTION_PROVIDER ?? 'mock';
  const model = process.env.OPENAI_TRANSCRIPTION_MODEL ?? 'gpt-4o-mini-transcribe';
  realtimeLines.push(`[${new Date().toISOString()}] Chunk accepted by ${provider}/${model}`);
});

ipcMain.handle('transcription:stop', async () => {
  realtimeLines.push('Realtime session stopped.');
  return realtimeLines;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: new URL('./preload.js', import.meta.url).pathname,
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadURL(process.env.ELECTRON_RENDERER_URL ?? 'http://localhost:5173');
}

app.whenReady().then(createWindow);
