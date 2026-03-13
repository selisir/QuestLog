const { app, BrowserWindow, ipcMain, shell, Menu } = require('electron')
const path = require('path')
const fs = require('fs')

// Percorso per salvare i dati in modo persistente (nella cartella utente)
const dataPath = path.join(app.getPath('userData'), 'questlog-data.json')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'QuestLog — Il Tuo Cammino Eroico',
    backgroundColor: '#1C1008',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    // Rimuove la barra dei menu di default
    autoHideMenuBar: true,
    // Icona (opzionale, se presente)
    // icon: path.join(__dirname, 'assets/icon.png')
  })

  win.loadFile(path.join(__dirname, 'src/index.html'))

  // Menu minimalista
  const menu = Menu.buildFromTemplate([
    {
      label: 'QuestLog',
      submenu: [
        { label: 'Ricarica', accelerator: 'CmdOrCtrl+R', click: () => win.reload() },
        { type: 'separator' },
        { label: 'Esci', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Visualizza',
      submenu: [
        { label: 'Zoom +', accelerator: 'CmdOrCtrl+Plus', click: () => { win.webContents.setZoomLevel(win.webContents.getZoomLevel() + 0.5) } },
        { label: 'Zoom -', accelerator: 'CmdOrCtrl+-', click: () => { win.webContents.setZoomLevel(win.webContents.getZoomLevel() - 0.5) } },
        { label: 'Zoom Normale', accelerator: 'CmdOrCtrl+0', click: () => { win.webContents.setZoomLevel(0) } },
        { type: 'separator' },
        { label: 'Schermo Intero', accelerator: 'F11', click: () => win.setFullScreen(!win.isFullScreen()) },
        { label: 'DevTools', accelerator: 'F12', click: () => win.webContents.toggleDevTools() }
      ]
    }
  ])
  Menu.setApplicationMenu(menu)
}

// IPC: lettura dati da file (più affidabile di localStorage su desktop)
ipcMain.handle('load-data', () => {
  try {
    if (fs.existsSync(dataPath)) {
      return fs.readFileSync(dataPath, 'utf-8')
    }
    return null
  } catch (e) {
    console.error('Errore lettura dati:', e)
    return null
  }
})

// IPC: salvataggio dati su file
ipcMain.handle('save-data', (event, data) => {
  try {
    fs.writeFileSync(dataPath, data, 'utf-8')
    return true
  } catch (e) {
    console.error('Errore salvataggio dati:', e)
    return false
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
