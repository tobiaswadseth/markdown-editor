const { app, BrowserWindow, Menu, MenuItem, ipcMain, dialog } = require('electron')
const fs = require('fs')

let confirmed = false

let mainWindow

let unsavedChanges

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    mainWindow.setTitle('Markdown Editor')
    mainWindow.loadFile('./public/index.html')

    const createNewFile = content => {
        dialog.showSaveDialog(mainWindow, {
            title: 'Create New File',
            properties: ['showOverwriteConfirmation'],
            filters: [
                {
                    name: 'Markdown Files',
                    extensions: ['md']
                }
            ]
        }).then(({ canceled, filePath }) => {
            if (canceled) return

            fs.writeFile(filePath, content, err => {
                if (err) return

                mainWindow.webContents.send('fileopened', {
                    path: filePath,
                    content
                })
                return true
            })
        })
        return false
    }

    const openFile = () => {
        const file = dialog.showOpenDialogSync(mainWindow, {
            properties: ['openFile'],
            filters: [{ name: 'Markdown Files', extensions: ['md'] }]
        })

        if (file) {
            fs.readFile(file[0], 'utf-8', (err, data) => {
                if (err) return

                mainWindow.webContents.send('fileopened', {
                    path: file[0],
                    content: data
                })
            })
        }
    }

    ipcMain.on('savenewfile', (e, content) => {
        if (createNewFile(content)) {
            e.reply('update')
        }
    })

    ipcMain.on('saveexistingfile', (e, { path, content }) => {
        fs.writeFile(path, content, err => {
            if (err) return
        })
        e.reply('update')
    })

    ipcMain.on('unsavedchanges-reply', (e, msg) => {
        unsavedChanges = msg.state
    })

    const menu = new Menu()

    menu.append(
        new MenuItem({
            role: 'appMenu'
        })
    )

    menu.append(
        new MenuItem({
            role: 'fileMenu',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => createNewFile()
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Open...',
                    accelerator: 'CmdOrCtrl+O',
                    click: openFile
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Save',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => mainWindow.webContents.send('savefile')
                },
                {
                    type: 'separator'
                }
            ]
        })
    )

    menu.append(
        new MenuItem({
            role: 'editMenu'
        })
    )

    menu.append(
        new MenuItem({
            role: 'viewMenu'
        })
    )

    menu.append(
        new MenuItem({
            role: 'windowMenu'
        })
    )

    menu.append(
        new MenuItem({
            role: 'helpMenu'
        })
    )

    Menu.setApplicationMenu(menu)

    mainWindow.on('close', e => {
        if (!confirmed) {
            if (unsavedChanges) {
                dialog.showMessageBox(null, {
                    type: 'warning',
                    buttons: ['Cancel', 'Save', 'Don\'t Save'],
                    defaultId: 1,
                    message: 'Do you want to save the changes you made?',
                    detail: 'Your changes will be lost if you don\'t save them.'
                }).then(data => {
                    let res = data.response
                    if (res === 0) {
                        return
                    } else if (res === 1) {
                        confirmed = true
                        mainWindow.webContents.send('savefile')
                        mainWindow.close()
                    } else {
                        confirmed = true
                        mainWindow.close()
                    }
                })
                e.preventDefault()
            }
        }
    })
})

app.on('before-quit', e => {
    if (!confirmed) {
        if (unsavedChanges) {
            dialog.showMessageBox(null, {
                type: 'warning',
                buttons: ['Cancel', 'Save', 'Don\'t Save'],
                defaultId: 1,
                message: 'Do you want to save the changes you made?',
                detail: 'Your changes will be lost if you don\'t save them.'
            }).then(data => {
                let res = data.response
                if (res === 0) {
                    return
                } else if (res === 1) {
                    confirmed = true
                    mainWindow.webContents.send('savefile')
                    mainWindow.close()
                } else {
                    confirmed = true
                    mainWindow.close()
                }
            })
            e.preventDefault()
        }
    }
})

app.on('window-all-closed', () => {
    app.quit()
})