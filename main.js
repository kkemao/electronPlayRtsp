// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDevelopment = process.env.NODE_ENV === "dev";

// // 设置开机自动启动
const production = process.env.NODE_ENV !== 'develop ';
console.log('zkf-dev', production, process.env.NODE_ENV);
if(production){
  app.setLoginItemSettings({
    openAtLogin: true,
    args: ["--openAsHidden"],
  });
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: production,
    resizable: true,
    // frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      webSecurity: false,
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  // mainWindow.setMenu(null);

  // and load the index.html of the app.
  // mainWindow.loadFile('http://localhost:37654')
  mainWindow.loadFile("renderer/server.html");

  // Open the DevTools.
  !production && mainWindow.webContents.openDevTools();

  // 启动时隐藏
  production && mainWindow.hide();

  // 点击关闭隐藏到后台
  mainWindow.on("close", (event) => {
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
    event.preventDefault();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  app.on("ready", async () => {
    // if (!isDevelopment) launchAtStartup();
    // launchAtStartup();
  });

  function launchAtStartup() {
    if (process.platform === "darwin") {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
      });
    } else {
      app.setLoginItemSettings({
        openAtLogin: true,
        openAsHidden: true,
        path: updateExe,
        args: [
          "--processStart",
          `"${exeName}"`,
          "--process-start-args",
          `"--hidden"`,
        ],
      });
    }
  }

  createWindow();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
