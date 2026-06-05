const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: '照片地理定位器',
    icon: path.join(__dirname, '../assets/icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
    show: false,
    titleBarStyle: 'default',
  });

  // 加载前端页面
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口准备好后再显示，避免白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC: 选择文件夹（替代 webkitdirectory，支持多选）
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: '选择照片文件夹',
  });
  return result.canceled ? null : result.filePaths[0];
});

// IPC: 读取文件夹内图片文件
ipcMain.handle('read-folder-images', async (event, folderPath) => {
  const fs = require('fs');
  const path = require('path');

  const allowedExts = ['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.heic', '.heif'];

  try {
    const entries = fs.readdirSync(folderPath, { withFileTypes: true });
    const files = entries
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const ext = path.extname(entry.name).toLowerCase();
        return {
          name: entry.name,
          path: path.join(folderPath, entry.name),
          size: fs.statSync(path.join(folderPath, entry.name)).size,
          ext,
        };
      })
      .filter((f) => allowedExts.includes(f.ext));

    return files;
  } catch (err) {
    return { error: err.message };
  }
});
