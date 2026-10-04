// Bridge between the ring (ESP32-CAM, its own Wi-Fi: ws://192.168.4.1:81/) and the Qu hub.
//
//   ring  --JPEGs, button text-->  phone (this file)  --same messages-->  hub  -->  browser app
//   ring  <--capture, feedback--   phone              <--same messages--   hub
//
// The messages are the repo's Wi-Fi ring protocol (src/vision/README.md), passed through untouched in
// both directions, so the browser app and the hub need no changes. Pure TypeScript (no React Native
// imports) and the WebSocket class is injectable, so it is tested against real sockets in Node.

export type Link = 'idle' | 'connecting' | 'live' | 'retrying';
export type PressAction = 'click' | 'double' | 'hold';

export interface RelayState {
  ring: Link;
  hub: Link;
  ringDetail: string; // why a link is down: "closed: code 1006", "error: ..."
  hubDetail: string;
  framesIn: number; // pictures received from the ring
  framesSent: number; // forwarded to the hub
  framesDropped: number; // skipped: over the frame-rate limit, or the hub link is backed up
  lastButton: string; // last button press from the ring or the screen
}

interface Sock {
  readyState: number;
  binaryType: string;
  bufferedAmount: number;
  send(data: string | ArrayBuffer): void;
  close(): void;
  onopen: ((e: unknown) => void) | null;
  onmessage: ((e: { data: unknown }) => void) | null;
  onclose: ((e: { code?: number; reason?: string }) => void) | null;
  onerror: ((e: { message?: string }) => void) | null;
}
type SockCtor = new (url: string) => Sock;

export interface RelayOptions {
  ringUrl: string;
  hubUrl: string;
  onState: (s: RelayState) => void;
  /** Called with some of the ring's pictures (about 2 a second) for a preview on the phone. */
  onFrame?: (jpeg: ArrayBuffer) => void;
  /** The hub asked for a buzz/beep (feedback message), e.g. to buzz the phone as well. */
  onFeedback?: (kind: string) => void;
  /** Messages from the hub meant for this app, not the ring (e.g. {"type":"detected", ...}). */
  onHubMessage?: (msg: Record<string, unknown>) => void;
  /** A ring button press. Return true when the app handles it itself; it is then not sent to the hub. */
  handleRingButton?: (a: PressAction) => boolean;
  /** WebSocket class; defaults to the platform's. Tests pass the `ws` package. */
  WS?: SockCtor;
  /** Stream mode pushes pictures nonstop. Forward at most this many a second (the hub link may be a phone tunnel). */
  maxFps?: number;
  /** Skip a picture when this many bytes are already waiting to go to the hub. */
  maxBuffered?: number;
  retryMs?: number[];
  pingMs?: number;
}

const OPEN = 1;
// The only hub messages the ring firmware understands; everything else is for the app.
const RING_COMMANDS = new Set(['capture', 'feedback']);
const CAPTURE_WINDOW_MS = 8000; // after a capture request every picture is wanted: no frame limit

export function startRelay(o: RelayOptions): { stop(): void; press(a: PressAction): boolean } {
  const WS: SockCtor = o.WS ?? (globalThis as unknown as { WebSocket: SockCtor }).WebSocket;
  const maxFps = o.maxFps ?? 4;
  const maxBuffered = o.maxBuffered ?? 512 * 1024;
  const retry = o.retryMs ?? [500, 1000, 2000, 4000];
  const state: RelayState = { ring: 'idle', hub: 'idle', ringDetail: '', hubDetail: '', framesIn: 0, framesSent: 0, framesDropped: 0, lastButton: '' };
  let stopped = false;
  let lastForward = 0;
  let lastPreview = 0;
  let captureUntil = 0;
  const emit = () => o.onState({ ...state });

  function link(name: 'ring' | 'hub', url: string, onMessage: (data: unknown) => void) {
    let sock: Sock | null = null;
    let attempt = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const detail = name === 'ring' ? 'ringDetail' : 'hubDetail';

    const open = () => {
      if (stopped) return;
      state[name] = attempt > 0 ? 'retrying' : 'connecting';
      emit();
      let opened = false;
      let s: Sock;
      try {
        s = new WS(url);
      } catch (e) {
        state[name] = 'retrying';
        state[detail] = `bad address: ${String(e).slice(0, 80)}`;
        emit();
        timer = setTimeout(open, retry[Math.min(attempt++, retry.length - 1)]);
        return;
      }
      s.binaryType = 'arraybuffer';
      sock = s;
      s.onopen = () => {
        opened = true;
        attempt = 0;
        state[name] = 'live';
        state[detail] = '';
        emit();
      };
      s.onmessage = (e) => onMessage(e.data);
      s.onerror = (e) => {
        state[detail] = `error: ${e.message ?? 'connection failed'}`;
        emit();
      };
      s.onclose = (e) => {
        if (sock !== s) return;
        sock = null;
        if (stopped) return;
        state[name] = 'retrying';
        if (!opened || !state[detail]) state[detail] = `closed: code ${e.code ?? '?'}${e.reason ? ` ${e.reason}` : ''}`;
        emit();
        timer = setTimeout(open, retry[Math.min(attempt++, retry.length - 1)]);
      };
    };
    open();
    return {
      send: (d: string | ArrayBuffer): boolean => {
        if (!sock || sock.readyState !== OPEN) return false;
        try {
          sock.send(d);
          return true;
        } catch {
          return false;
        }
      },
      buffered: () => sock?.bufferedAmount ?? 0,
      close: () => {
        clearTimeout(timer);
        const s = sock;
        sock = null;
        if (s) {
          s.onclose = null;
          s.close();
        }
      },
    };
  }

  const ring = link('ring', o.ringUrl, (data) => {
    if (typeof data === 'string') {
      // button presses ("click" or {"type":"button","action":"click"}), "burst-end", status text: pass through
      const t = data.trim();
      if (t.includes('burst-end')) captureUntil = 0;
      const m = /"action"\s*:\s*"(click|double|hold)"/.exec(t) ?? /^(click|double|hold)$/.exec(t);
      if (m) {
        const action = m[1] as PressAction;
        state.lastButton = action;
        emit();
        if (o.handleRingButton?.(action)) return; // handled on the phone (e.g. a quick reply)
      }
      hub.send(data);
      return;
    }
    const jpeg = data as ArrayBuffer;
    state.framesIn++;
    const now = Date.now();
    if (o.onFrame && now - lastPreview >= 500) {
      lastPreview = now;
      o.onFrame(jpeg);
    }
    const wanted = now < captureUntil; // answering a capture request: never drop
    if (!wanted && now - lastForward < 1000 / maxFps) {
      state.framesDropped++;
      return emit();
    }
    if (!wanted && hub.buffered() > maxBuffered) {
      state.framesDropped++;
      return emit();
    }
    if (hub.send(jpeg)) {
      lastForward = now;
      state.framesSent++;
    } else {
      state.framesDropped++;
    }
    emit();
  });

  const hub = link('hub', o.hubUrl, (data) => {
    if (typeof data !== 'string') return;
    let msg: Record<string, unknown> | null = null;
    try {
      const v = JSON.parse(data) as unknown;
      if (v && typeof v === 'object' && !Array.isArray(v)) msg = v as Record<string, unknown>;
    } catch {
      // not JSON: passed to the ring unchanged
    }
    if (msg && typeof msg.type === 'string' && !RING_COMMANDS.has(msg.type)) {
      o.onHubMessage?.(msg); // for the app's screen; the ring would not understand it (and it may be large)
      return;
    }
    if (data.includes('"capture"')) captureUntil = Date.now() + CAPTURE_WINDOW_MS;
    if (data.includes('"feedback"')) {
      try {
        const k = (JSON.parse(data) as { kind?: string }).kind;
        if (k) o.onFeedback?.(k);
      } catch {
        // not JSON: still forwarded
      }
    }
    ring.send(data); // capture requests and buzz/beep feedback go to the ring
  });

  const keepalive = setInterval(() => hub.send(JSON.stringify({ type: 'ping' })), o.pingMs ?? 15000);

  return {
    stop() {
      stopped = true;
      clearInterval(keepalive);
      ring.close();
      hub.close();
      state.ring = 'idle';
      state.hub = 'idle';
      emit();
    },
    /** A press from the on-screen button (backup for the ring's own button). */
    press(a) {
      state.lastButton = a;
      emit();
      return hub.send(JSON.stringify({ type: 'button', action: a }));
    },
  };
}
