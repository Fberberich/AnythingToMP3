# Pushing this project to GitHub

1. **Create a new repo on GitHub**  
   Go to https://github.com/new, choose a name (e.g. `audio-converter`), leave it empty (no README/license).

2. **From the project folder, run:**

   ```bash
   cd "d:\Scripts for work\audio-converter"
   git init
   git add .
   git commit -m "Initial commit: Audio to MP3 converter with Electron build"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your GitHub username and repo name.

3. **Get the installable app**  
   After pushing, open the repo → **Actions** tab. The “Build installable app” workflow will run. When it finishes, open the latest run and download:
   - **windows-installer** (contains `.exe` and portable)
   - **linux-installer** (contains `.AppImage` and `.deb`)
