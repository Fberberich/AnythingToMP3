import { app as electronApp, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('http').Server | null} */
let server = null;

function getPublicPath() {
  return path.join(__dirname, '..', 'public');
}

async function createWindow() {
  const { createApp } = await import('../server.js');
  const expressApp = createApp(getPublicPath());
  server = createServer(expressApp);

  await new Promise((resolve, reject) => {
    server.listen(0, '127.0.0.1', () => resolve());
    server.on('error', reject);
  });

  const port = server.address().port;
  const url = `http://127.0.0.1:${port}`;

  const win = new BrowserWindow({
    width: 520,
    height: 640,
    minWidth: 400,
    minHeight: 500,
    webPreferences: { nodeIntegration: false, contextIsolation: true },
    title: 'Audio → MP3 Converter',
    show: false,
  });

  win.once('ready-to-show', () => win.show());
  win.loadURL(url);

  win.on('closed', () => {
    if (server) {
      server.close();
      server = null;
    }
  });
}

electronApp.whenReady().then(createWindow);

electronApp.on('window-all-closed', () => {
  if (server) server.close();
  electronApp.quit();
});

electronApp.on('before-quit', () => {
  if (server) server.close();
});
