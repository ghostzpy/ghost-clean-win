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

function cleanSoftwareDistribution() {
  new Notification({
    title: 'Limpando atualizações do Windows',
    body: 'Processo iniciado. Por favor, aguarde...'
  }).show();

  // 1. Verificar o estado atual do serviço wuauserv
  exec('sc qc wuauserv', (error, stdout) => {
    if (error) {
      dialog.showErrorBox("Erro", "Não foi possível verificar o estado do serviço Windows Update.");
      return;
    }

    const isAuto = /START_TYPE\s+: 2/.test(stdout);
    const isManual = /START_TYPE\s+: 3/.test(stdout);
    const originalState = isAuto ? 'auto' : isManual ? 'manual' : 'unknown';

    // Salva o estado em sessionStorage
    sessionStorage.setItem('wuauservState', originalState);

    // 2. Para o serviço temporariamente
    exec('net stop wuauserv', (stopErr) => {
      if (stopErr) {
        dialog.showErrorBox("Erro", "Falha ao parar o serviço Windows Update.");
        return;
      }

      // 3. Limpa a pasta Download de SoftwareDistribution
      exec('del /f /s /q C:\\Windows\\SoftwareDistribution\\Download\\*.*', (delErr, _, delStderr) => {
        let resultMsg = '';

        if (delErr || (delStderr && delStderr.trim() !== '')) {
          resultMsg = 'Erro ao limpar arquivos de atualização. Verifique permissões.';
          console.warn("Erro:", delErr || delStderr);
        } else {
          resultMsg = 'Arquivos de atualização antigos foram limpos com sucesso!';
        }

        // 4. Restaura o serviço ao estado original
        let restoreCmd = '';
        if (originalState === 'auto') {
          restoreCmd = 'sc config wuauserv start= auto && net start wuauserv';
        } else if (originalState === 'manual') {
          restoreCmd = 'sc config wuauserv start= demand';
        }

        exec(restoreCmd, () => {
          // Remove do sessionStorage
          sessionStorage.removeItem('wuauservState');

          dialog.showMessageBox({
            type: delErr ? 'warning' : 'info',
            buttons: ['OK'],
            message: resultMsg
          });
        });
      });
    });
  });
}

function openCleanMgr() {
  dialog.showMessageBox({
    type: 'info',
    buttons: ['OK'],
    title: 'Limpeza de Disco',
    message: 'O utilitário de limpeza de disco do Windows será aberto.\n\nSelecione a unidade que deseja limpar.'
  }).then(() => {
    exec('cleanmgr', { windowsHide: true }, (error) => {
      if (error) {
        dialog.showErrorBox("Erro ao abrir o Cleanmgr", error.message);
      }
    });
  });
}

function cleanWinLogs() {
  // 🔔 Notificação rápida, não bloqueante
  new Notification({
    title: 'Iniciando limpeza',
    body: 'A limpeza das Logs está sendo realizada. Por favor, aguarde...'
  }).show();

  const commands = [
    'del /f /s /q C:\\Windows\\Logs\\*',
    'del /f /s /q C:\\Windows\\System32\\LogFiles\\*'
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

module.exports = {
  cleanTemporaryFolders,
  startSFCScan,
  cleanSoftwareDistribution,
  openCleanMgr,
  cleanWinLogs
};