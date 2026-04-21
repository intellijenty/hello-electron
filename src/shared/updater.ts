import { UpdateInfo, ProgressInfo } from "electron-updater";

export type UpdaterEvent =
  | { type: "checking" }
  | { type: "available"; info: UpdateInfo }
  | { type: "not-available"; info: UpdateInfo }
  | { type: "progress"; info: ProgressInfo }
  | { type: "downloaded"; info: UpdateInfo }
  | { type: "error"; message: string };

export interface UpdaterAPI {
  getVersion(): Promise<string>;
  check(): void;
  download(): void;
  install(): void;
  onEvent(callback: (event: UpdaterEvent) => void): () => void;
}

export const UPDATER_IPC = {
  event: "updater:event",
  check: "updater:check",
  download: "updater:download",
  install: "updater:install",
} as const;
