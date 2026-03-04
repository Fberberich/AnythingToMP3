// Dynamic import so the page loads even if FFmpeg paths fail; we load libs when user clicks "Load FFmpeg"
let FFmpegClass = null;
let fetchFileFn = null;
let ffmpeg = null;
let loaded = false;
let selectedFile = null;

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const chooseBtn = document.getElementById('chooseBtn');
const btnLoad = document.getElementById('btnLoad');
const btnConvert = document.getElementById('btnConvert');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const messageEl = document.getElementById('message');
const logEl = document.getElementById('log');

// Sync with file chosen before this script loaded (inline script sets window.__audioConverterFile)
if (window.__audioConverterFile) {
  selectedFile = window.__audioConverterFile;
  if (fileName) fileName.textContent = selectedFile.name;
}

// ——— File selection ———
chooseBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  const file = fileInput.files && fileInput.files[0];
  if (file) setFile(file);
});

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  dropzone.classList.add('dragover');
});
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

function setFile(file) {
  if (!file) return;
  selectedFile = file;
  window.__audioConverterFile = file;
  fileName.textContent = file.name;
  btnConvert.disabled = !loaded;
  hideMessage();
}

// ——— Load FFmpeg ———
btnLoad.addEventListener('click', async () => {
  if (loaded) return;
  btnLoad.disabled = true;
  btnLoad.textContent = 'Loading…';
  showMessage('Loading FFmpeg from local server…', 'info');
  showLog();

  try {
    const [{ FFmpeg }, { fetchFile }] = await Promise.all([
      import('/lib/ffmpeg/index.js'),
      import('/lib/util/index.js'),
    ]);
    FFmpegClass = FFmpeg;
    fetchFileFn = fetchFile;

    ffmpeg = new FFmpeg();

    ffmpeg.on('log', ({ message }) => {
      if (logEl) {
        logEl.textContent = (logEl.textContent + message).slice(-3000);
        logEl.scrollTop = logEl.scrollHeight;
      }
    });

    await ffmpeg.load({
      coreURL: '/lib/core/ffmpeg-core.js',
      wasmURL: '/lib/core/ffmpeg-core.wasm',
    });

    loaded = true;
    btnLoad.textContent = 'FFmpeg loaded';
    hideMessage();
    showMessage('Ready. Choose a file and click Convert to MP3.', 'success');
    if (selectedFile) btnConvert.disabled = false;
  } catch (err) {
    console.error(err);
    showMessage('Failed to load FFmpeg: ' + (err.message || String(err)), 'error');
    btnLoad.disabled = false;
    btnLoad.textContent = 'Load FFmpeg (local, one-time)';
  }
});

// ——— Convert ———
btnConvert.addEventListener('click', async () => {
  if (!loaded || !ffmpeg || !fetchFileFn || !selectedFile) return;

  btnConvert.disabled = true;
  progressWrap.classList.add('visible');
  progressFill.style.width = '0%';
  progressText.textContent = 'Preparing…';
  hideMessage();
  logEl.classList.add('visible');
  logEl.textContent = '';

  const inputName = 'input' + getExtension(selectedFile.name);
  const outputName = getBaseName(selectedFile.name) + '.mp3';

  try {
    progressText.textContent = 'Reading file…';
    await ffmpeg.writeFile(inputName, await fetchFileFn(selectedFile));

    progressText.textContent = 'Converting to MP3…';
    progressFill.style.width = '30%';

    ffmpeg.on('progress', ({ progress }) => {
      if (typeof progress === 'number' && progress > 0) {
        progressFill.style.width = `${30 + Math.round(progress * 70)}%`;
      }
    });

    await ffmpeg.exec([
      '-i', inputName,
      '-vn',
      '-acodec', 'libmp3lame',
      '-q:a', '2',
      outputName
    ]);

    progressFill.style.width = '100%';
    progressText.textContent = 'Done.';

    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputName;
    a.textContent = `Download ${outputName}`;
    a.className = 'download-link';

    messageEl.className = 'message visible success';
    messageEl.innerHTML = 'Conversion complete. ';
    messageEl.appendChild(a);

    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
  } catch (err) {
    console.error(err);
    showMessage('Conversion failed: ' + (err.message || String(err)), 'error');
  } finally {
    btnConvert.disabled = !loaded;
    progressWrap.classList.remove('visible');
  }
});

function getExtension(name) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i) : '';
}

function getBaseName(name) {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(0, i) : name;
}

function showMessage(text, type) {
  messageEl.className = 'message visible ' + (type || 'info');
  messageEl.textContent = text;
  messageEl.innerHTML = text;
}

function hideMessage() {
  messageEl.className = 'message';
  messageEl.textContent = '';
  messageEl.innerHTML = '';
}

function showLog() {
  logEl.classList.add('visible');
}
