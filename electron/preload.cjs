const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readFolderImages: (folderPath) => ipcRenderer.invoke('read-folder-images', folderPath),
});
