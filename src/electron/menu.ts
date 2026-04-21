import { app, BrowserWindow, Menu } from "electron";
import { ipcWebContentsSend, isDev } from "./util.js";

export function createMenu(mainWindow: BrowserWindow) {
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      {
        label: process.platform === "darwin" ? undefined : "App",
        type: "submenu",
        submenu: [
          {
            label: "Quit",
            accelerator: "CmdOrCtrl+Q",
            click: () => app.quit(),
          },
          {
            label: "DevTools",
            accelerator: "CmdOrCtrl+I",
            click: () => mainWindow.webContents.toggleDevTools(),
            visible: isDev(),
          },
        ],
      },
      {
        label: "View",
        type: "submenu",
        submenu: [
          {
            label: "CPU",
            click: () => {
              ipcWebContentsSend("changeView", mainWindow.webContents, "CPU");
            },
          },
          {
            label: "MEMORY",
            click: () => {
              ipcWebContentsSend("changeView", mainWindow.webContents, "MEMORY");
            },
          },
          {
            label: "DISK",
            click: () => {
              ipcWebContentsSend("changeView", mainWindow.webContents, "DISK");
            },
          },
        ],
      },
    ])
  );
}
