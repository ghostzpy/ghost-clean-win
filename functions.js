const { exec } = require('child_process');
const { dialog, Notification } = require('@electron/remote');

function cleanTemporaryFolders() {
  // 🔔 Notificação rápida, não bloqueante
  new Notification({
    title: 'Iniciando limpeza',
    body: 'A limpeza está sendo realizada. Por favor, aguarde...'
  }).show();

  const commands = [
    'del /f /s /q %temp%\\*',
    'del /f /s /q C:\\Windows\\Temp\\*',
    'del /f /s /q C:\\Windows\\Prefetch\\*'
  ];

  let completed = 0;

  commands.forEach(cmd => {
    exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
      completed++;
      if (error) console.warn(`Erro ao executar: ${cmd}\n${error}`);
      if (completed === commands.length) {
        askToEmptyRecycleBin();
      }
    });
  });
}

function askToEmptyRecycleBin() {
  dialog.showMessageBox({
    type: 'question',
    buttons: ['Sim', 'Não'],
    defaultId: 0,
    cancelId: 1,
    title: 'Limpeza concluída',
    message: 'Pastas temporárias foram limpas com sucesso.\n\nDeseja esvaziar a Lixeira também?'
  }).then(({ response }) => {
    if (response === 0) {
      emptyRecycleBin();
    }
  });
}

function emptyRecycleBin() {
  const cmd = 'PowerShell.exe -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"';

  exec(cmd, { windowsHide: true }, (error, stdout, stderr) => {
    // Mesmo com erro, se não houver stderr, consideramos sucesso
    if (stderr && stderr.trim() !== "") {
      console.warn("⚠️ Stderr recebido da limpeza:", stderr);
      dialog.showErrorBox("Aviso", "Houve um aviso durante a limpeza da Lixeira. Ela pode ter sido esvaziada parcialmente.");
    } else {
      dialog.showMessageBox({
        type: 'info',
        message: 'Lixeira esvaziada com sucesso!',
        buttons: ['OK']
      });
    }
  });
}

function startSFCScan() {
  dialog.showMessageBox({
    type: 'info',
    buttons: ['OK'],
    title: 'Verificação de arquivos do sistema',
    message: 'O sistema irá abrir o PowerShell e iniciar o comando "sfc /scannow".\n\nEsse processo pode levar vários minutos. Aguarde a conclusão antes de fechar o terminal.'
  }).then(() => {
    exec('start powershell -NoExit -Command "sfc /scannow"', (error, stdout, stderr) => {
      if (error) {
        dialog.showErrorBox("Erro ao iniciar verificação", error.message);
      }
    });
  });
}

module.exports = {
  cleanTemporaryFolders,
  startSFCScan
};