// Ring bridge. Two WebSocket endpoints on the hub:
//   /ring   the browser connects here as if it were the ring board (camera + button)
//   /phone  a phone (phone/ Expo app) or any other ring stand-in connects here
// Messages are relayed untouched in both directions, so the protocol is exactly the one in
// src/vision/README.md ("Wi-Fi (WebSocket)"): JPEG binaries, {"type":"capture"}, {"type":"burst-end"},
// {"type":"button"}, {"type":"feedback"}. Fake presses (emit) go to the browsers as button events.
import type { Server as HttpServer } from "node:http";
import { WebSocketServer, type RawData, type WebSocket } from "ws";

export type RingAction = "click" | "double" | "hold";
export const RING_ACTIONS: readonly RingAction[] = ["click", "double", "hold"];

export function isRingAction(v: unknown): v is RingAction {
  return typeof v === "string" && (RING_ACTIONS as readonly string[]).includes(v);
}

export interface RingBus {
  /** Send a fake button event to every connected browser. Returns how many received it. */
  emit(action: RingAction): number;
  browsers(): number;
  phones(): number;
  onFeedback(cb: (kind: string) => void): void;
}

function relay(to: Set<WebSocket>, data: RawData, isBinary: boolean): void {
  for (const c of to) if (c.readyState === c.OPEN) c.send(data, { binary: isBinary });
}

export function attachRing(server: HttpServer): RingBus {
  const browserWss = new WebSocketServer({ noServer: true });
  const phoneWss = new WebSocketServer({ noServer: true });
  const browsers = browserWss.clients;
  const phones = phoneWss.clients;
  const feedbackCbs: ((kind: string) => void)[] = [];

  server.on("upgrade", (req, socket, head) => {
    const path = new URL(req.url ?? "/", "http://hub").pathname;
    const wss = path === "/ring" ? browserWss : path === "/phone" ? phoneWss : null;
    if (!wss) return socket.destroy();
    wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req));
  });

  // Tunnels and proxies close sockets that stay quiet. Ping every 20 s; drop a client that never answers.
  const alive = new WeakMap<WebSocket, boolean>();
  const beat = setInterval(() => {
    for (const set of [browsers, phones]) {
      for (const c of set) {
        if (alive.get(c) === false) {
          c.terminate();
          continue;
        }
        alive.set(c, false);
        c.ping();
      }
    }
  }, 20_000);
  beat.unref();
  for (const w of [browserWss, phoneWss]) w.on("connection", (ws) => {
    alive.set(ws, true);
    ws.on("pong", () => alive.set(ws, true));
  });

  browserWss.on("connection", (ws) => {
    console.log(`[hub] browser connected (${browsers.size})`);
    ws.on("message", (data, isBinary) => {
      if (isBinary) return;
      try {
        const msg = JSON.parse(data.toString()) as { type?: string; kind?: unknown };
        if (msg.type === "feedback" && typeof msg.kind === "string") for (const cb of feedbackCbs) cb(msg.kind);
      } catch {
        // not JSON; still relayed below
      }
      relay(phones, data, false); // capture requests and feedback go to the phone
    });
  });

  phoneWss.on("connection", (ws) => {
    console.log(`[hub] phone connected (${phones.size})`);
    ws.on("message", (data, isBinary) => {
      if (!isBinary && data.toString().includes('"ping"')) return; // app-level keepalive from the phone
      relay(browsers, data, isBinary); // JPEGs, burst-end, buttons
    });
    ws.on("close", (code, reason) => console.log(`[hub] phone left (${phones.size}) code=${code} reason=${reason.toString() || "-"}`));
    ws.on("error", (err) => console.log(`[hub] phone socket error: ${err.message}`));
  });

  return {
    emit(action) {
      const text = JSON.stringify({ type: "button", action });
      let sent = 0;
      for (const c of browsers) {
        if (c.readyState === c.OPEN) {
          c.send(text);
          sent++;
        }
      }
      return sent;
    },
    browsers: () => browsers.size,
    phones: () => phones.size,
    onFeedback: (cb) => void feedbackCbs.push(cb),
  };
}
