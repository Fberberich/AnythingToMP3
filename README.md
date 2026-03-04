# Audio → MP3 Converter

A local web app that converts **M4A** and **any video file** (MP4, WebM, MOV, AVI, etc.) to MP3 in your browser. No files are uploaded to any server; conversion runs locally via FFmpeg compiled to WebAssembly.

## How to run

1. **Install dependencies** (Node.js required):

   ```bash
   cd audio-converter
   npm install
   ```

2. **Start the server** (this copies FFmpeg into `public/lib` and then starts the app):

   ```bash
   npm start
   ```

3. **Open in your browser**:  
   Go to **http://localhost:3000**

4. **Use the app**:
   - Click **Load FFmpeg** once (loads from your local server).
   - Choose an M4A or video file (drag-and-drop or click to select).
   - Click **Convert to MP3** and then **Download** when it’s done.

## Installable app (Windows / Linux)

The project can be built into a desktop app (`.exe` on Windows, `.AppImage` / `.deb` on Linux) using Electron.

- **Build locally:**  
  `npm run build` (builds for your current OS), or `npm run build:win` / `npm run build:linux`.
- **Build on GitHub:**  
  Push to `main` (or run the “Build installable app” workflow). Installers are in the **Actions** tab → latest run → **Artifacts** (`windows-installer`, `linux-installer`).

## Notes

- **Fully local:** The app and FFmpeg (JS + WASM) are served from your machine. No CDNs or external requests — conversion and all assets stay on your computer.
- The first time you click “Load FFmpeg”, the browser loads the WebAssembly build from the local server; it’s then cached.
- Use the app at `http://localhost:3000` (from `npm start`); do not open the HTML file directly.
