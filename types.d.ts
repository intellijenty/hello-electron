type Statistics = {
  cpuUsage: number;
  memoryUsage: number;
  storageUsage: number;
};

type StaticData = {
  totalStorage: number;
  cpuModel: string;
  totalMemoryGB: number;
};

type EventPayloadMapping = {
  statistics: Statistics;
  getStaticData: StaticData;
  changeView: ViewName;
  sendFrameWindowAction: FrameWindowAction;
};

type ViewName = "CPU" | "MEMORY" | "DISK";
type FrameWindowAction = "MINIMIZE" | "MAXIMIZE" | "CLOSE";

type UnsubscribeFunction = () => void;

interface Window {
  electron: {
    subscribeStatistics: (callback: (statistics: Statistics) => void) => UnsubscribeFunction;
    getStaticData: () => Promise<StaticData>;
    subscribeChangeView: (callback: (view: ViewName) => void) => UnsubscribeFunction;
    sendFrameWindowAction: (action: FrameWindowAction) => void;
  };
}
