const { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
    const mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            devTools: false
        }
    })
    mainWindow.setTitle('Markdown Editor')
    mainWindow.loadFile('./public/index.html')
})

app.on('window-all-closed', () => {
    app.quit()
})