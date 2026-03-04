import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, 'node_modules');
const out = path.join(__dirname, 'public', 'lib');

const copies = [
  { from: path.join(root, '@ffmpeg/ffmpeg/dist/esm'), to: path.join(out, 'ffmpeg') },
  { from: path.join(root, '@ffmpeg/util/dist/esm'), to: path.join(out, 'util') },
  { from: path.join(root, '@ffmpeg/core/dist/esm'), to: path.join(out, 'core') },
];

for (const { from, to } of copies) {
  if (!fs.existsSync(from)) {
    console.error('Missing:', from);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (fs.existsSync(to)) fs.rmSync(to, { recursive: true });
  fs.cpSync(from, to, { recursive: true });
  console.log('Copied:', path.relative(__dirname, from), '->', path.relative(__dirname, to));
}
console.log('Lib copy done.');
