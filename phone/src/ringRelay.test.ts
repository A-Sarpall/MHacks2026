import { afterEach, beforeEach, describe, expect, it } from 'vitest';
// The phone folder has its own older `ws` (Expo's); the tests want the repo's.
import { WebSocket, WebSocketServer } from '../../node_modules/ws/wrapper.mjs';
import { startRelay, type RelayState } from './ringRelay';

// A stand-in ring (server) on one side, a stand-in hub (server) on the other, real sockets between them.
interface Peer {
  srv: WebSocketServer;
  url: string;
  conns: WebSocket[];
  got: { text?: string; bytes?: number }[];
}

async function peer(): Promise<Peer> {
  const srv = new WebSocketServer({ port: 0 });
  const p: Peer = { srv, url: '', conns: [], got: [] };
  srv.on('connection', (ws) => {
    p.conns.push(ws);
    ws.on('message', (d, isBinary) => p.got.push(isBinary ? { bytes: (d as Buffer).length } : { text: d.toString() }));
  });
  await new Promise<void>((r) => srv.once('listening', () => r()));
  p.url = `ws://127.0.0.1:${(srv.address() as { port: number }).port}/`;
  return p;
}

const until = async (cond: () => boolean, ms = 3000) => {
  const end = Date.now() + ms;
  while (!cond()) {
    if (Date.now() > end) throw new Error('timed out waiting');
    await new Promise((r) => setTimeout(r, 10));
  }
};
const jpeg = (n = 100) => Buffer.alloc(n, 0xff);

let ring: Peer;
let hub: Peer;
let state: RelayState;
let stop: () => void;
let feedback: string[];
let press: (a: 'click' | 'double' | 'hold') => boolean;
let appMsgs: Record<string, unknown>[];
let localButtons: string[];

beforeEach(async () => {
  ring = await peer();
  hub = await peer();
  feedback = [];
  appMsgs = [];
  localButtons = [];
  const r = startRelay({
    ringUrl: ring.url,
    hubUrl: hub.url,
    WS: WebSocket as never,
    onState: (s) => (state = s),
    onFeedback: (k) => feedback.push(k),
    onHubMessage: (m) => appMsgs.push(m),
    handleRingButton: (a) => (a === 'double' ? (localButtons.push(a), true) : false),
    retryMs: [40],
    pingMs: 60_000,
  });
  stop = r.stop;
  press = r.press;
  await until(() => state?.ring === 'live' && state?.hub === 'live');
});

afterEach(() => {
  stop();
  ring.srv.close();
  hub.srv.close();
});

describe('ring -> hub', () => {
  it('passes a picture through untouched', async () => {
    ring.conns[0].send(jpeg(1234));
    await until(() => hub.got.length === 1);
    expect(hub.got[0]).toEqual({ bytes: 1234 });
    expect(state.framesIn).toBe(1);
    expect(state.framesSent).toBe(1);
  });

  it('passes button presses through in both formats and remembers the last one', async () => {
    ring.conns[0].send('click');
    ring.conns[0].send(JSON.stringify({ type: 'button', action: 'hold' }));
    await until(() => hub.got.length === 2);
    expect(hub.got.map((g) => g.text)).toEqual(['click', '{"type":"button","action":"hold"}']);
    expect(state.lastButton).toBe('hold');
  });

  it('limits a nonstop stream to the frame rate', async () => {
    for (let i = 0; i < 20; i++) ring.conns[0].send(jpeg());
    await until(() => state.framesIn === 20);
    expect(state.framesSent).toBeLessThanOrEqual(2);
    expect(state.framesDropped).toBeGreaterThanOrEqual(18);
  });
});

describe('hub -> ring', () => {
  it('forwards a capture request, and then every picture it answers with', async () => {
    hub.conns[0].send(JSON.stringify({ type: 'capture', count: 5 }));
    await until(() => ring.got.some((g) => g.text?.includes('"capture"')));
    for (let i = 0; i < 5; i++) ring.conns[0].send(jpeg());
    ring.conns[0].send(JSON.stringify({ type: 'burst-end' }));
    await until(() => hub.got.filter((g) => g.bytes).length === 5 && hub.got.some((g) => g.text?.includes('burst-end')));
    expect(state.framesDropped).toBe(0);
  });

  it('goes back to limiting frames once the burst has ended', async () => {
    hub.conns[0].send(JSON.stringify({ type: 'capture', count: 1 }));
    await until(() => ring.got.length === 1);
    ring.conns[0].send(jpeg());
    ring.conns[0].send(JSON.stringify({ type: 'burst-end' }));
    await until(() => hub.got.length === 2);
    for (let i = 0; i < 10; i++) ring.conns[0].send(jpeg());
    await until(() => state.framesIn === 11);
    expect(state.framesDropped).toBeGreaterThanOrEqual(8);
  });

  it('forwards feedback to the ring and tells the app', async () => {
    hub.conns[0].send(JSON.stringify({ type: 'feedback', kind: 'captured' }));
    await until(() => ring.got.length === 1);
    expect(ring.got[0].text).toBe('{"type":"feedback","kind":"captured"}');
    expect(feedback).toEqual(['captured']);
  });
});

describe('the phone as the screen', () => {
  it('keeps app messages (like what was recognised) for the app and never sends them to the ring', async () => {
    const detected = { type: 'detected', status: 'named', label: 'water bottle', options: [] };
    hub.conns[0].send(JSON.stringify(detected));
    hub.conns[0].send(JSON.stringify({ type: 'feedback', kind: 'select' }));
    await until(() => appMsgs.length === 1 && ring.got.length === 1);
    expect(appMsgs[0]).toEqual(detected);
    expect(ring.got[0].text).toBe('{"type":"feedback","kind":"select"}');
  });

  it('lets the app handle some ring buttons itself and sends the rest to the hub', async () => {
    ring.conns[0].send('double');
    ring.conns[0].send('click');
    await until(() => hub.got.length === 1 && localButtons.length === 1);
    expect(localButtons).toEqual(['double']);
    expect(hub.got[0].text).toBe('click');
  });
});

describe('links', () => {
  it('reconnects to the ring when it drops, without touching the hub link', async () => {
    ring.conns[0].close();
    await until(() => state.ring === 'retrying' || ring.conns.length === 2);
    await until(() => state.ring === 'live' && ring.conns.length === 2);
    expect(state.hub).toBe('live');
    ring.conns[1].send(jpeg(77));
    await until(() => hub.got.some((g) => g.bytes === 77));
  });

  it('keeps trying when the ring is not there yet, and says why', async () => {
    stop();
    const quiet = await peer();
    const dead = quiet.url;
    quiet.srv.close();
    let s!: RelayState;
    const r = startRelay({ ringUrl: dead, hubUrl: hub.url, WS: WebSocket as never, onState: (x) => (s = x), retryMs: [30], pingMs: 60_000 });
    await until(() => s?.hub === 'live');
    await until(() => s.ring === 'retrying' && s.ringDetail !== '');
    expect(s.ringDetail).toMatch(/error|closed/);
    r.stop();
  });

  it('sends a screen-button press to the hub, and says so when the hub is down', async () => {
    expect(press('double')).toBe(true);
    await until(() => hub.got.some((g) => g.text === '{"type":"button","action":"double"}'));
    expect(state.lastButton).toBe('double');
    hub.conns[0].close();
    await until(() => state.hub !== 'live');
    expect(press('click')).toBe(false);
  });
});
