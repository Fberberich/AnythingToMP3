import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PUBLIC = path.join(__dirname, 'public');

/**
 * Create the Express app. Used by both CLI and Electron.
 * @param {string} [publicDir] - Override public directory (e.g. in packaged app).
 * @returns {express.Express}
 */
export function createApp(publicDir = DEFAULT_PUBLIC) {
  const app = express();

  app.use((req, res, next) => {
    if (req.path.endsWith('.wasm')) res.setHeader('Content-Type', 'application/wasm');
    next();
  });

  app.use(express.static(publicDir));
  app.get('/', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

  return app;
}

// Run as standalone server when executed directly
const isMain = process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1]);
if (isMain) {
  const PORT = 3000;
  createApp().listen(PORT, () => {
    console.log(`\n  Audio → MP3 Converter: http://localhost:${PORT}`);
    console.log('  All conversion is local — no external requests.\n');
  });
}
