import { useEffect, useMemo, useState } from "react";
import "./App.css";
import useStatistics from "./useStatistics";
import Chart from "./Chart";
import useStaticData from "./useStaticData";

const COLOR_MAP = {
  CPU: {
    stroke: "#007AFF",
    fill: "#E3F2FD",
    gradient: "linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)",
    shadow: "0 4px 20px rgba(0, 122, 255, 0.15)",
  },
  MEMORY: {
    stroke: "#FF9500",
    fill: "#FFF3E0",
    gradient: "linear-gradient(135deg, #FF9500 0%, #FFCC02 100%)",
    shadow: "0 4px 20px rgba(255, 149, 0, 0.15)",
  },
  DISK: {
    stroke: "#34C759",
    fill: "#E8F5E8",
    gradient: "linear-gradient(135deg, #34C759 0%, #30D158 100%)",
    shadow: "0 4px 20px rgba(52, 199, 89, 0.15)",
  },
};

function App() {
  const [view, setView] = useState<ViewName>("CPU");

  const statistics = useStatistics(10);
  const staticData = useStaticData();

  const cpuUsage = useMemo(() => statistics.map((item) => item.cpuUsage), [statistics]);
  const memoryUsage = useMemo(() => statistics.map((item) => item.memoryUsage), [statistics]);
  const diskUsage = useMemo(() => statistics.map((item) => item.storageUsage), [statistics]);

  const activeViewData = useMemo(() => {
    switch (view) {
      case "CPU":
        return cpuUsage;
      case "MEMORY":
        return memoryUsage;
      case "DISK":
        return diskUsage;
      default:
        return cpuUsage;
    }
  }, [view, cpuUsage, memoryUsage, diskUsage]);

  useEffect(() => {
    return window.electron.subscribeChangeView((view) => setView(view));
  }, []);

  return (
    <div className="app-container">
      <header className="window-header">
        <div className="window-controls">
          <button
            id="close"
            className="control-btn close-btn"
            onClick={() => window.electron.sendFrameWindowAction("CLOSE")}
          />
          <button
            id="minimize"
            className="control-btn minimize-btn"
            onClick={() => window.electron.sendFrameWindowAction("MINIMIZE")}
          />
          <button
            id="maximize"
            className="control-btn maximize-btn"
            onClick={() => window.electron.sendFrameWindowAction("MAXIMIZE")}
          />
        </div>
        <div className="app-title">
          <span className="title-text">System Monitor</span>
        </div>
      </header>

      <div className="main-content">
        <h1 className="hero-title">
          Electron + Vite + React + Me + <span className="love">💗</span>
        </h1>

        <div className="dashboard-layout">
          <aside className="sidebar">
            <SidebarCard
              title="CPU"
              subtitle={staticData.data?.cpuModel ?? "Processing Unit"}
              data={cpuUsage}
              onClick={() => setView("CPU")}
              fill={COLOR_MAP.CPU.fill}
              stroke={COLOR_MAP.CPU.stroke}
              shadow={COLOR_MAP.CPU.shadow}
              isActive={view === "CPU"}
            />
            <SidebarCard
              title="Memory"
              subtitle={staticData.data?.totalMemoryGB + " GB RAM"}
              data={memoryUsage}
              onClick={() => setView("MEMORY")}
              fill={COLOR_MAP.MEMORY.fill}
              stroke={COLOR_MAP.MEMORY.stroke}
              shadow={COLOR_MAP.MEMORY.shadow}
              isActive={view === "MEMORY"}
            />
            <SidebarCard
              title="Storage"
              subtitle={staticData.data?.totalStorage + " GB"}
              data={diskUsage}
              onClick={() => setView("DISK")}
              fill={COLOR_MAP.DISK.fill}
              stroke={COLOR_MAP.DISK.stroke}
              shadow={COLOR_MAP.DISK.shadow}
              isActive={view === "DISK"}
            />
          </aside>

          <main className="main-chart">
            <div className="chart-container" style={{ boxShadow: COLOR_MAP[view].shadow }}>
              <div className="chart-header">
                <h2 className="chart-title">
                  {view === "MEMORY" ? "Memory" : view === "DISK" ? "Storage" : "CPU"} Usage
                </h2>
                <div
                  className="chart-indicator"
                  style={{ background: COLOR_MAP[view].stroke }}
                ></div>
              </div>
              <div className="chart-wrapper">
                <Chart
                  fill={COLOR_MAP[view].fill}
                  stroke={COLOR_MAP[view].stroke}
                  data={activeViewData}
                  maxDataPoints={10}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarCard({
  title,
  subtitle,
  data,
  onClick,
  stroke,
  fill,
  shadow,
  isActive,
}: {
  title: string;
  subtitle: string;
  data: number[];
  onClick: () => void;
  fill?: string;
  stroke?: string;
  shadow?: string;
  isActive?: boolean;
}) {
  const currentUsage = data[data.length - 1] || 0;

  return (
    <div
      className={`sidebar-card ${isActive ? "active" : ""}`}
      onClick={onClick}
      style={{
        boxShadow: isActive ? shadow : "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="card-header">
        <div className="card-title-section">
          <span className="card-title">{title}</span>
          <span className="card-usage" style={{ color: stroke }}>
            {Math.round(currentUsage * 100)}%
          </span>
        </div>
        <div className="card-subtitle">{subtitle}</div>
      </div>
      <div className="card-chart">
        <Chart fill={fill} stroke={stroke} data={data} maxDataPoints={3} />
      </div>
    </div>
  );
}

export default App;
