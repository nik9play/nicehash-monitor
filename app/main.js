const {app, remote, BrowserWindow} = require('electron')
const path = require('path')
const url = require('url')
const settings = require('electron-settings')

let win

function createWindow () {
  // Открыть окно
  win = new BrowserWindow({
	  width: 800,
	  height: 600,
	  icon: "E:\\_Projects\\JS\\NodeJS\\nicehash-monitor\\access\\png\\64x64.png"
  })

  // закгрузка страницы
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // девтулы
  win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

app.on('ready', createWindow)


// settings start
// settings end


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})