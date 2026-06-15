const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readFolderImages: (folderPath) => ipcRenderer.invoke('read-folder-images', folderPath),
  // 系统级文件拖拽：把真实文件路径交给 OS 处理
  startDrag: (filePath) => ipcRenderer.send('ondragstart', filePath),
});
