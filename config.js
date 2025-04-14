const { getCurrentWindow, BrowserWindow } = require('@electron/remote');

window.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("close-config-btn");
  const opacityRange = document.getElementById("opacity-range");
  const opacityValue = document.getElementById("opacity-value");
  const reduceAnimationsCheckbox = document.getElementById("reduce-animations");

  const savedOpacity = localStorage.getItem('backgroundOpacity') || "60";
  const rgba = `rgba(0, 0, 0, ${parseInt(savedOpacity) / 100})`;

  document.body.style.backgroundColor = rgba;
  opacityRange.value = savedOpacity;
  opacityValue.textContent = `${savedOpacity}%`;

  // Animações - carregar preferência
  const reduceAnimations = localStorage.getItem("reduceAnimations") === "true";
  reduceAnimationsCheckbox.checked = reduceAnimations;

  opacityRange.addEventListener("input", () => {
    const value = opacityRange.value;
    const newRgba = `rgba(0, 0, 0, ${parseInt(value) / 100})`;

    opacityValue.textContent = `${value}%`;
    document.body.style.backgroundColor = newRgba;
    localStorage.setItem('backgroundOpacity', value);

    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
      const title = win.getTitle();
      if (title.includes("Gosth Clean")) {
        win.webContents.executeJavaScript(
          `document.body.style.backgroundColor = '${newRgba}'`
        );
      }
    });
  });

  reduceAnimationsCheckbox.addEventListener("change", () => {
    localStorage.setItem("reduceAnimations", reduceAnimationsCheckbox.checked ? "true" : "false");

    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach(win => {
      win.webContents.executeJavaScript(`
        if (${reduceAnimationsCheckbox.checked}) {
          document.body.classList.add("reduce-animations");
        } else {
          document.body.classList.remove("reduce-animations");
        }
      `);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      getCurrentWindow().close();
    });
  }
});