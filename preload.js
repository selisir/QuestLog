const { contextBridge, ipcRenderer } = require('electron')

// Espone in modo sicuro le API di Electron alla pagina HTML
contextBridge.exposeInMainWorld('electronAPI', {
  // Salva i dati su file (invece di localStorage)
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  // Carica i dati da file
  loadData: () => ipcRenderer.invoke('load-data'),
  // Flag per sapere che siamo in Electron
  isElectron: true
})
