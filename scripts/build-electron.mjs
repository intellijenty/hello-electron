import { build } from "esbuild";
import { rmSync } from "fs";

rmSync("dist-electron", { recursive: true, force: true });

const shared = {
  bundle: true,
  platform: "node",
  target: "node20",
  packages: "external",
  format: "cjs",
};

await Promise.all([
  build({
    ...shared,
    entryPoints: ["src/electron/main.ts"],
    outfile: "dist-electron/main.js",
  }),
  build({
    ...shared,
    entryPoints: ["src/electron/preload.cts"],
    outfile: "dist-electron/preload.js",
  }),
]);
