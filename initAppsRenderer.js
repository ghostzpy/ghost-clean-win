const { getCurrentWindow } = require('@electron/remote');
const path = require('path');
const fs = require('fs');
const os = require('os');
const WinReg = require('winreg');
const extractIcon = require('extract-file-icon');

const userRun = new WinReg({ hive: WinReg.HKCU, key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' });
const machineRun = new WinReg({ hive: WinReg.HKLM, key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' });

const startupFolders = [
  path.join(process.env.APPDATA, 'Microsoft\\Windows\\Start Menu\\Programs\\Startup'),
  path.join(process.env.PROGRAMDATA, 'Microsoft\\Windows\\Start Menu\\Programs\\Startup'),
];

window.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.getElementById("close-appinit-btn");
  const savedOpacity = localStorage.getItem('backgroundOpacity') || "60";
  document.body.style.backgroundColor = `rgba(0, 0, 0, ${parseInt(savedOpacity) / 100})`;

  if (closeBtn) {
    closeBtn.addEventListener("click", () => getCurrentWindow().close());
  }

  const listContainer = document.getElementById("listforinit");

  const extractIconPath = (exePath, name) => {
    try {
      const iconBuffer = extractIcon(exePath, 64);
      if (iconBuffer) {
        const iconTempPath = path.join(os.tmpdir(), `${name}_icon.png`);
        fs.writeFileSync(iconTempPath, iconBuffer);
        return iconTempPath;
      }
    } catch (e) {
      console.warn(`Erro ao extrair ícone de ${exePath}: ${e.message}`);
    }
    return "exename-default.png";
  };

  const renderItem = (name, command, scope, enabled = true) => {
    const checkboxId = `chk_${name}_${scope}`;
    const exePath = command.split('"')[1] || command.split(' ')[0];
    const iconPath = extractIconPath(exePath, name);

    const container = document.createElement("div");
    container.className = "listforinit-item-container";

    container.innerHTML = `
      <label class="listforinit-item-container-checkbox">
        <input type="checkbox" id="${checkboxId}" ${enabled ? "checked" : ""}>
        <div class="listforinit-item-container-checkbox-checkmark"></div>
      </label>
      <div class="listforinit-item-container-divisor"></div>
      <div class="listforinit-item-container-imageicon">
        <img src="${iconPath}" onerror="this.src='exename-default.png'">
      </div>
      <div class="listforinit-item-container-app-name">${name}</div>
    `;

    listContainer.appendChild(container);

    const checkbox = container.querySelector(`#${checkboxId}`);
    checkbox.addEventListener("change", () => {
      if (scope === 'user' || scope === 'machine') {
        const reg = scope === 'user' ? userRun : machineRun;
        if (checkbox.checked) {
          reg.set(name, WinReg.REG_SZ, command, (err) => {
            if (err) console.error("Erro ao ativar:", err);
          });
        } else {
          reg.remove(name, (err) => {
            if (err) console.error("Erro ao remover:", err);
          });
        }
      } else {
        alert("Não é possível modificar esse item por aqui.");
        checkbox.checked = true;
      }
    });
  };

  const loadRegistryItems = (reg, scope) => {
    reg.values((err, items) => {
      if (err) {
        console.error(`Erro ao acessar ${scope}:`, err);
        return;
      }
      const sorted = items.sort((a, b) => a.name.localeCompare(b.name));
      sorted.forEach(i => {
        renderItem(i.name, i.value, scope, true);
      });
    });
  };

  const loadStartupFolderItems = () => {
    startupFolders.forEach(folder => {
      if (fs.existsSync(folder)) {
        const files = fs.readdirSync(folder);
        const valid = files
          .filter(f => f.endsWith('.lnk') || f.endsWith('.exe'))
          .sort((a, b) => a.localeCompare(b));
        valid.forEach(file => {
          const fullPath = path.join(folder, file);
          renderItem(path.parse(file).name, fullPath, 'startup-folder', true);
        });
      }
    });
  };

  loadRegistryItems(userRun, 'user');
  loadRegistryItems(machineRun, 'machine');
  loadStartupFolderItems();
});