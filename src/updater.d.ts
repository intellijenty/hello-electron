// src/updater.d.ts
import type { UpdaterAPI } from "./shared/updater";

declare global {
  interface Window {
    updater: UpdaterAPI;
  }
}
