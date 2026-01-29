import { app, BrowserWindow } from 'electron';
import { fork } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let serverProcess;
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: true, // Modo Totem - Fullscreen
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  // Carrega a URL do servidor local Express
  mainWindow.loadURL('http://localhost:3000');

  // Se o servidor cair, tenta recarregar
  mainWindow.webContents.on('did-fail-load', () => {
    console.log('Falha ao carregar a página. Tentando novamente...');
    setTimeout(() => mainWindow.loadURL('http://localhost:3000'), 1000);
  });

  // Atalhos de manutenção
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Ctrl+Q: Sair do app
    if (input.control && input.key.toLowerCase() === 'q') {
      app.quit();
      event.preventDefault();
    }
    // F5: Recarregar
    if (input.key === 'F5') {
      mainWindow.reload();
      event.preventDefault();
    }
    // F12: DevTools (apenas em desenvolvimento)
    if (input.key === 'F12' && process.env.NODE_ENV === 'development') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  // Inicia o servidor Express gerado pelo esbuild (dist/index.js)
  const serverPath = path.join(__dirname, 'dist/index.js');
  
  console.log(`Iniciando servidor backend: ${serverPath}`);
  
  serverProcess = fork(serverPath, [], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      PORT: '3000'
    }
  });

  serverProcess.on('error', (err) => {
    console.error('Erro ao iniciar o servidor backend:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log(`Servidor backend encerrado com código: ${code}`);
  });

  serverProcess.stdout?.on('data', (data) => {
    console.log(`[Backend] ${data}`);
  });

  serverProcess.stderr?.on('data', (data) => {
    console.error(`[Backend Error] ${data}`);
  });
}

// Inicia o app quando o Electron está pronto
app.whenReady().then(() => {
  startBackend();
  
  // Aguarda um pouco para o servidor subir antes de abrir a janela
  setTimeout(createWindow, 2000);

  app.on('activate', () => {
    // No macOS, re-criar a janela quando o dock é clicado
    if (mainWindow === null) {
      createWindow();
    }
  });
});

// Encerra o app quando todas as janelas são fechadas
app.on('window-all-closed', () => {
  // Encerra o servidor backend
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // No Windows e Linux, encerra o app
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Impede múltiplas instâncias do app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Se alguém tentar abrir uma segunda instância, foca a primeira
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
