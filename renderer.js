const { shell } = require('electron');
const { app, getCurrentWindow, BrowserWindow, screen } = require('@electron/remote');
const path = require('path');
const { cleanTemporaryFolders, startSFCScan } = require('./functions');

let configWin = null;

window.addEventListener('DOMContentLoaded', () => {
  // Aplica opacidade salva ao body
  const savedOpacity = localStorage.getItem('backgroundOpacity') || "60";
  document.body.style.backgroundColor = `rgba(0, 0, 0, ${parseInt(savedOpacity) / 100})`;

  // Botões
  const closeBtn = document.getElementById("close-btn");
  const cleanBtn = document.getElementById("clean-btn");
  const sfcBtn = document.getElementById("sfcnow-btn");
  const shortcutsBtn = document.getElementById("shortcuts-btn");
  const settingsBtn = document.getElementById("settings-btn");

  // Botão fechar app
  closeBtn?.addEventListener("click", () => {
    console.log("❌ Fechando app completo...");
    app.quit();
  });

  // Botão limpeza
  cleanBtn?.addEventListener("click", () => {
    console.log("🧹 Iniciando limpeza...");
    cleanTemporaryFolders();
  });

  // Botão sfc
  sfcBtn?.addEventListener("click", () => {
    console.log("🔍 Iniciando verificação SFC...");
    startSFCScan();
  });

  // Botão Atalhos
  shortcutsBtn?.addEventListener("click", () => {
    const shortcutsFolder = `${process.env.APPDATA}\\Microsoft\\Windows\\Start Menu\\Programs`;
    shell.openPath(shortcutsFolder)
      .then(result => {
        if (result) {
          console.error("❌ Erro ao abrir a pasta:", result);
        } else {
          console.log("📂 Pasta de atalhos aberta com sucesso.");
        }
      });
  });

  // Botão configurações
  settingsBtn?.addEventListener("click", () => {
    if (configWin && !configWin.isDestroyed()) {
      console.log("🔄 Janela de configurações já está aberta. Focando...");
      configWin.focus();
      return;
    }

    const mainWin = getCurrentWindow();
    const [x, y] = [mainWin.getBounds().x, mainWin.getBounds().y];
    const [width, height] = [600, 400];
    const newX = x + 50;
    const newY = y + 50;

    console.log("⚙️ Criando nova janela de configurações...");

    configWin = new BrowserWindow({
      width,
      height,
      x: newX,
      y: newY,
      frame: false,
      resizable: false,
      transparent: true,
      vibrancy: 'dark',
      backgroundColor: '#00000000',
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true
      }
    });

    configWin.loadFile(path.join(__dirname, 'config.html'));

    configWin.on('closed', () => {
      configWin = null;
    });
  });
});