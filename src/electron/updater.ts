import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { BrowserWindow } from "electron";
import { UPDATER_IPC, UpdaterEvent } from "../shared/updater.js";

export function initUpdater(getWindow: () => BrowserWindow | null) {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;
  log.transports.file.level = "info";

  const emit = (event: UpdaterEvent) =>
    getWindow()?.webContents.send(UPDATER_IPC.event, event);

  autoUpdater.on("checking-for-update", () => emit({ type: "checking" }));
  autoUpdater.on("update-available", (info) =>
    emit({ type: "available", info }),
  );
  autoUpdater.on("update-not-available", (info) =>
    emit({ type: "not-available", info }),
  );
  autoUpdater.on("download-progress", (info) =>
    emit({ type: "progress", info }),
  );
  autoUpdater.on("update-downloaded", (info) =>
    emit({ type: "downloaded", info }),
  );
  autoUpdater.on("error", (err) =>
    emit({ type: "error", message: err.message }),
  );

  return {
    check: () => autoUpdater.checkForUpdates().catch((err) => log.error(err)),
    download: () => autoUpdater.downloadUpdate().catch((err) => log.error(err)),
    install: () => autoUpdater.quitAndInstall(),
  };
}
