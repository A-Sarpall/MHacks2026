import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { WebSocketServer } from "ws";

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : fallback;
};
const flag = (name) => args.includes(`--${name}`);

const dir = opt("dir", "test-images");
const port = Number(opt("port", "8181"));
const fps = Number(opt("fps", "8"));
const still = flag("still");
const dropAfter = Number(opt("drop-after", "0"));
const frameDelay = Number(opt("frame-delay", "0"));
const single = flag("single");
const sequential = flag("sequential");

const files = readdirSync(dir)
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort()
  .map((f) => join(dir, f));
if (files.length === 0) {
  console.error(`[mock-ring] no .jpg files in ${dir}`);
  process.exit(1);
}
const frames = files.map((f) => readFileSync(f));
let index = 0;
const next = () => frames[index++ % frames.length];

const wss = new WebSocketServer({ port });
console.log(
  `[mock-ring] ws://localhost:${port}/ · ${frames.length} images · ${still ? "still" : `stream @ ${fps} fps`}` +
    (single ? " · single-image firmware" : "") +
    (frameDelay ? ` · ${frameDelay} ms per image` : "")
);
console.log("[mock-ring] type c / d / h + Enter to press the button (click / double / hold)");

wss.on("connection", (ws) => {
  console.log("[mock-ring] client connected");
  let sent = 0;
  const timer = still
    ? null
    : setInterval(() => {
        ws.send(next(), { binary: true });
        sent++;
        if (dropAfter && sent >= dropAfter) {
          console.log("[mock-ring] dropping connection");
          ws.terminate();
        }
      }, 1000 / fps);
  ws.on("message", (data, isBinary) => {
    if (isBinary) return;
    const text = data.toString();
    let msg = {};
    try {
      msg = JSON.parse(text);
    } catch {
      msg = { type: text };
    }
    if (msg.type === "capture") void sendBurst(ws, single ? 1 : Math.max(1, Number(msg.count) || 1));
    else console.log(`[mock-ring] <- ${text}`);
  });
  ws.on("close", () => {
    if (timer) clearInterval(timer);
    console.log("[mock-ring] client disconnected");
  });
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function sendBurst(ws, count) {
  for (let i = 0; i < count; i++) {
    if (frameDelay) await sleep(frameDelay);
    ws.send(sequential ? next() : frames[i % frames.length], { binary: true });
  }
  if (!single) ws.send(JSON.stringify({ type: "burst-end" }));
  console.log(`[mock-ring] sent ${count} image${count === 1 ? "" : "s"}`);
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  const key = chunk.trim()[0];
  const action = { c: "click", d: "double", h: "hold" }[key];
  if (!action) return;
  const msg = JSON.stringify({ type: "button", action });
  for (const client of wss.clients) client.send(msg);
  console.log(`[mock-ring] -> ${msg}`);
});
