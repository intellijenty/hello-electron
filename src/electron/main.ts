import { app, BrowserWindow, Menu } from "electron";
import { ipcMainHandle, ipcMainOn, isDev } from "./util.js";
import { getStaticData, pollResources } from "./resourceManager.js";
import { getPreloadPath, getUIPath } from "./pathResolver.js";
import { createTray } from "./tray.js";
import { createMenu } from "./menu.js";
import { initUpdater } from "./updater.js";
import { UPDATER_IPC } from "../shared/updater.js";

Menu.setApplicationMenu(null);

app.on("ready", () => {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: getPreloadPath(),
    },
    frame: false,
  });

  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(getUIPath());
  }

  createTray(mainWindow);
  createMenu(mainWindow);
  handleCloseEvents(mainWindow);

  if (app.isPackaged) {
    const updater = initUpdater(() => mainWindow);
    ipcMainOn(UPDATER_IPC.check, updater.check);
    ipcMainOn(UPDATER_IPC.download, updater.download);
    ipcMainOn(UPDATER_IPC.install, updater.install);
  }

  pollResources(mainWindow);

  ipcMainHandle("getStaticData", () => getStaticData());

  ipcMainOn("sendFrameWindowAction", (action: FrameWindowAction) => {
    switch (action) {
      case "MINIMIZE":
        mainWindow.minimize();
        break;
      case "MAXIMIZE":
        if (mainWindow.isMaximized()) {
          mainWindow.unmaximize();
        } else {
          mainWindow.maximize();
        }
        break;
      case "CLOSE":
        mainWindow.close();
        break;
    }
  });
});

function handleCloseEvents(mainWindow: BrowserWindow) {
  let willClose = false;

  mainWindow.on("close", (e) => {
    if (willClose) return;

    e.preventDefault();
    mainWindow.hide();
    app.dock?.hide();
  });

  app.on("before-quit", () => {
    willClose = true;
  });

  mainWindow.on("show", () => {
    willClose = false;
  });
}
