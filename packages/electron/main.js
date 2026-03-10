const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Em desenvolvimento, carrega do Vite. Em produção, carrega o index.html gerado.
  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../../apps/frontend/dist/index.html'));
  }
}

function startBackend() {
  const isDev = !app.isPackaged;
  
  // No iCoffe, o backend NestJS roda localmente
  // Em desenvolvimento, podemos assumir que o usuário rodou o backend separado ou dar spawn
  if (!isDev) {
    backendProcess = spawn('node', [path.join(__dirname, '../../apps/backend/dist/main.js')]);
    
    backendProcess.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });
  }
}

app.whenReady().then(() => {
  startBackend();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});
