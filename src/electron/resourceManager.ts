import os from "os";
import fs from "fs";
import osUtils from "os-utils";
import { BrowserWindow } from "electron";
import { ipcWebContentsSend } from "./util.js";

const POLLING_INTERVAL = 500;

export const pollResources = (mainWindow: BrowserWindow) => {
  setInterval(async () => {
    const cpuUsage = await getCpuUsage();
    const memoryUsage = getMemoryUsage();
    const diskUsage = getDiskUsage();
    ipcWebContentsSend("statistics", mainWindow.webContents, {
      cpuUsage,
      memoryUsage,
      storageUsage: diskUsage.used,
    });
  }, POLLING_INTERVAL);
};

export const getStaticData = () => {
  return {
    totalStorage: getDiskUsage().total,
    cpuModel: os.cpus()[0].model,
    totalMemoryGB: Number.parseFloat((osUtils.totalmem() / 1024).toFixed(2)),
  };
};

const getCpuUsage = async () => {
  return new Promise<number>((resolve) => {
    osUtils.cpuUsage(resolve);
  });
};

const getMemoryUsage = () => {
  return 1 - osUtils.freememPercentage();
};

const getDiskUsage = () => {
  const states = fs.statfsSync(process.platform === "win32" ? "C:\\" : "/");
  const total = states.blocks * states.bsize;
  const free = states.blocks - states.bfree;
  return {
    total: Math.floor(total / 1_000_000_000),
    used: 1 - free / total,
  };
};
