// Copies MediaPipe's wasm runtime from node_modules into public/ so it is
// served locally and always matches the installed @mediapipe/tasks-vision version.
import { cpSync, existsSync } from "node:fs";

const src = "node_modules/@mediapipe/tasks-vision/wasm";
const dest = "public/mediapipe/wasm";

if (!existsSync(src)) {
  console.error(`[copy-wasm] ${src} not found — run npm install first`);
  process.exit(1);
}
cpSync(src, dest, { recursive: true });
console.log(`[copy-wasm] ${src} -> ${dest}`);
