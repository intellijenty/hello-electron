import electron from "electron";
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { UPDATER_IPC, UpdaterAPI, UpdaterEvent } from '../shared/updater';

electron.contextBridge.exposeInMainWorld("electron", {
  subscribeStatistics: (callback) => ipcOn("statistics", (stats: Statistics) => callback(stats)),
  getStaticData: () => ipcInvoke("getStaticData"),
  subscribeChangeView: (callback) => ipcOn("changeView", (view: ViewName) => callback(view)),
  sendFrameWindowAction: (action) => ipcSend("sendFrameWindowAction", action),
} satisfies Window["electron"]);

export function ipcInvoke<Key extends keyof EventPayloadMapping>(
  key: Key
): Promise<EventPayloadMapping[Key]> {
  return electron.ipcRenderer.invoke(key);
}

export function ipcOn<Key extends keyof EventPayloadMapping>(
  key: Key,
  callback: (payload: EventPayloadMapping[Key]) => void
) {
  const cb = (_: Electron.IpcRendererEvent, payload: EventPayloadMapping[Key]) => callback(payload);
  electron.ipcRenderer.on(key, cb);
  return () => electron.ipcRenderer.off(key, cb);
}

export function ipcSend<Key extends keyof EventPayloadMapping>(
  key: Key,
  payload: EventPayloadMapping[Key]
) {
  electron.ipcRenderer.send(key, payload);
}

const api: UpdaterAPI = {
  getVersion: () => ipcRenderer.invoke('app:version'),
  check: () => ipcRenderer.send(UPDATER_IPC.check),
  download: () => ipcRenderer.send(UPDATER_IPC.download),
  install: () => ipcRenderer.send(UPDATER_IPC.install),
  onEvent: (callback) => {
    const handler = (_: IpcRendererEvent, event: UpdaterEvent) => callback(event);
    ipcRenderer.on(UPDATER_IPC.event, handler);
    return () => ipcRenderer.off(UPDATER_IPC.event, handler);
  },
};

contextBridge.exposeInMainWorld('updater', api);