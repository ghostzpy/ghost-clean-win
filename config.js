const { getCurrentWindow, BrowserWindow } = require('@electron/remote');

window.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("close-config-btn");
  const opacityRange = document.getElementById("opacity-range");
  const opacityValue = document.getElementById("opacity-value");

  const savedOpacity = localStorage.getItem('backgroundOpacity') || "60";
  document.body.style.backgroundColor = `rgba(0, 0, 0, ${parseInt(savedOpacity) / 100})`;
  opacityRange.value = savedOpacity;
  opacityValue.textContent = `${savedOpacity}%`;

  opacityRange.addEventListener("input", () => {
    const value = opacityRange.value;
    opacityValue.textContent = `${value}%`;

    // 🔁 Atualiza opacidade local
    document.body.style.backgroundColor = `rgba(0, 0, 0, ${parseInt(value) / 100})`;
    localStorage.setItem('backgroundOpacity', value);

    // 🔁 Atualiza opacidade da janela principal em tempo real
    const allWindows = BrowserWindow.getAllWindows();
    const mainWin = allWindows.find(w => w.getTitle() === "Gosth Clean"); // ou w.id === 1 se você controlar o ID
    if (mainWin && !mainWin.isDestroyed()) {
      mainWin.webContents.executeJavaScript(
        `document.body.style.backgroundColor = 'rgba(0, 0, 0, ${parseInt(value) / 100})'`
      );
    }
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      getCurrentWindow().close();
    });
  }
});