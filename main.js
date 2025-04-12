const { app, BrowserWindow } = require('electron/main');
const remoteMain = require('@electron/remote/main');
const path = require('path');
const fs = require('fs');

if (process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: require(`${__dirname}/node_modules/electron`)
  });
}

// ✅ Inicializa remote
remoteMain.initialize();
console.log("🟢 remoteMain initialized");

// 🔄 Ativa remote em todas as janelas automaticamente
app.on('browser-window-created', (_, window) => {
  remoteMain.enable(window.webContents);
  console.log("🟢 remoteMain habilitado automaticamente na nova janela");
});

// 📁 Define caminho portátil para salvar dados ao lado do app
const exePath = process.cwd(); // <- portátil mesmo em npm start
const customDataPath = path.join(exePath, 'data');

// 📁 Cria pasta se ainda não existir
if (!fs.existsSync(customDataPath)) {
  fs.mkdirSync(customDataPath, { recursive: true });
}

// 🛡️ Redireciona onde os dados do app serão salvos
app.setPath('userData', customDataPath);
console.log("📁 userData path:", app.getPath('userData'));

function createWindow () {
  console.log("🟢 Creating main window...");

  const win = new BrowserWindow({
    width: 400,
    height: 600,
    title: "Gosth Clean",
    frame: false,
    transparent: true,
    vibrancy: 'dark',
    backgroundColor: '#00000000',
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  remoteMain.enable(win.webContents);
  console.log("🟢 remoteMain enabled on window");

  win.loadFile('index.html').then(() => {
    if (process.env.NODE_ENV !== 'production') {
      win.webContents.openDevTools();
    }
    console.log("✅ index.html loaded");
  }).catch(err => {
    console.error("❌ Failed to load index.html:", err);
  });
}

app.whenReady().then(() => {
  console.log("🚀 App is ready");
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      console.log("🔁 App re-activated, creating window again...");
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  console.log("❎ All windows closed");
  if (process.platform !== 'darwin') {
    console.log("🛑 Quitting app...");
    app.quit();
  }
});