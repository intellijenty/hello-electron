// src/components/UpdateManager.tsx
import { useEffect, useReducer } from "react";
import type { UpdateInfo, ProgressInfo } from "electron-updater";
import type { UpdaterEvent } from "./../shared/updater";

type State =
  | { phase: "idle" }
  | { phase: "checking" }
  | { phase: "available"; info: UpdateInfo }
  | { phase: "downloading"; info: UpdateInfo; progress: ProgressInfo | null }
  | { phase: "ready"; info: UpdateInfo }
  | { phase: "error"; message: string };

type Action = UpdaterEvent | { type: "dismiss" } | { type: "start-download" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "checking":
      return { phase: "checking" };
    case "available":
      return { phase: "available", info: action.info };
    case "not-available":
      return { phase: "idle" };
    case "start-download":
      return state.phase === "available"
        ? { phase: "downloading", info: state.info, progress: null }
        : state;
    case "progress":
      return state.phase === "downloading"
        ? { ...state, progress: action.info }
        : state;
    case "downloaded":
      return { phase: "ready", info: action.info };
    case "error":
      return { phase: "error", message: action.message };
    case "dismiss":
      return { phase: "idle" };
  }
}

const formatBytes = (b: number) =>
  b < 1024 * 1024
    ? `${(b / 1024).toFixed(0)} KB`
    : `${(b / 1024 / 1024).toFixed(1)} MB`;

export default function UpdateManager() {
  const [state, dispatch] = useReducer(reducer, { phase: "idle" });

  useEffect(() => {
    const unsubscribe = window.updater.onEvent(dispatch);
    window.updater.check();
    return unsubscribe;
  }, []);

  if (state.phase === "idle" || state.phase === "checking") return null;

  return (
    <div className="updater-overlay">
      <div className="updater-card">
        {state.phase === "available" && (
          <>
            <div className="updater-header">
              <span className="updater-badge">Update available</span>
              <strong>v{state.info.version}</strong>
            </div>
            {state.info.releaseNotes && (
              <div
                className="updater-notes"
                dangerouslySetInnerHTML={{
                  __html: String(state.info.releaseNotes),
                }}
              />
            )}
            <p className="updater-meta">
              Released {new Date(state.info.releaseDate).toLocaleDateString()}
            </p>
            <div className="updater-actions">
              <button
                className="updater-primary"
                onClick={() => {
                  dispatch({ type: "start-download" });
                  window.updater.download();
                }}
              >
                Download &amp; install
              </button>
              <button
                className="updater-ghost"
                onClick={() => dispatch({ type: "dismiss" })}
              >
                Later
              </button>
            </div>
          </>
        )}

        {state.phase === "downloading" && (
          <>
            <div className="updater-header">
              <span className="updater-badge">Downloading</span>
              <strong>v{state.info.version}</strong>
            </div>
            <div className="updater-progress">
              <div
                className="updater-progress-fill"
                style={{
                  width: `${Math.round(state.progress?.percent ?? 0)}%`,
                }}
              />
            </div>
            <p className="updater-meta updater-tabular">
              {state.progress
                ? `${Math.round(state.progress.percent)}% — ${formatBytes(state.progress.transferred)} / ${formatBytes(state.progress.total)}`
                : "Starting…"}
            </p>
          </>
        )}

        {state.phase === "ready" && (
          <>
            <div className="updater-header">
              <span className="updater-badge updater-badge--ready">Ready</span>
              <strong>v{state.info.version}</strong>
            </div>
            <p className="updater-meta">Update downloaded. Restart to apply.</p>
            <div className="updater-actions">
              <button
                className="updater-primary"
                onClick={() => window.updater.install()}
              >
                Restart &amp; install
              </button>
              <button
                className="updater-ghost"
                onClick={() => dispatch({ type: "dismiss" })}
              >
                Later
              </button>
            </div>
          </>
        )}

        {state.phase === "error" && (
          <>
            <p className="updater-error">Update failed: {state.message}</p>
            <button
              className="updater-ghost"
              onClick={() => dispatch({ type: "dismiss" })}
            >
              Dismiss
            </button>
          </>
        )}
      </div>
    </div>
  );
}
