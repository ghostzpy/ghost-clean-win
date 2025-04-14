const { app, BrowserWindow } = require('electron/main');
const remoteMain = require('@electron/remote/main');
const path = require('path');
const fs = require('fs');
const events = require('events');

// 💡 Aumenta limite de listeners para evitar warning
events.defaultMaxListeners = 30;

// if (process.env.NODE_ENV !== 'production') {
//   require('electron-reload')(__dirname, {
//     electron: require(`${__dirname}/node_modules/electron`)
//   });
// }

// ✅ Inicializa remote
remoteMain.initialize();
console.log("🟢 remoteMain initialized");

// 🔄 Ativa remote em todas as janelas automaticamente
app.on('browser-window-created', (_, window) => {
  if (!window.webContents.isDestroyed()) {
    remoteMain.enable(window.webContents);
    console.log("🟢 remoteMain habilitado automaticamente na nova janela");
  }
});

// 📁 Define caminho portátil para salvar dados ao lado do app
const exePath = process.cwd();
const customDataPath = path.join(exePath, 'data');

if (!fs.existsSync(customDataPath)) {
  fs.mkdirSync(customDataPath, { recursive: true });
}

app.setPath('userData', customDataPath);
console.log("📁 userData path:", app.getPath('userData'));

function createWindow () {
  console.log("🟢 Creating main window...");

  const win = new BrowserWindow({
    width: 500,
    height: 700,
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

  if (!win.webContents.isDestroyed()) {
    remoteMain.enable(win.webContents);
    console.log("🟢 remoteMain enabled on window");
  }

  win.loadFile('index.html').then(() => {
    // if (process.env.NODE_ENV !== 'production') {
    //   win.webContents.openDevTools();
    // }
    console.log("✅ index.html loaded");
  }).catch(err => {
    console.error("❌ Failed to load index.html:", err);
  });

  return win;
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