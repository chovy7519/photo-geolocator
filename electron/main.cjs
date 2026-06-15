const { app, BrowserWindow, ipcMain, dialog, webUtils } = require('electron');
const path = require('path');
const fs = require('fs');

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

// IPC: 获取拖拽文件的真实路径（Electron 环境专用）
// 浏览器使用 webUtils.getPathForFile(file) 拿到 file.path
ipcMain.handle('get-file-path', async (event, file) => {
  try {
    if (file && webUtils && typeof webUtils.getPathForFile === 'function') {
      return webUtils.getPathForFile(file);
    }
    return null;
  } catch (err) {
    return null;
  }
});

// IPC: 系统级文件拖拽 —— 把真实文件路径直接交给 OS 处理
// 当用户把 popup 照片拖出窗口到资源管理器/Finder 时触发
ipcMain.on('ondragstart', (event, filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) {
      event.sender.startDrag({
        file: filePath,
        icon: path.join(__dirname, '../assets/drag-icon.png'),
      });
    }
  } catch (err) {
    console.error('拖拽失败:', err);
  }
});
