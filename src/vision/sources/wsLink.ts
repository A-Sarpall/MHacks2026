import { StatusEmitter, type StatusInfo } from "./types";

const RETRY_MS = [500, 1000, 2000, 4000, 5000];

type BinaryListener = (data: ArrayBuffer) => void;
type TextListener = (text: string) => void;

export class WsLink {
  private ws: WebSocket | null = null;
  private status_ = new StatusEmitter();
  private binary = new Set<BinaryListener>();
  private text = new Set<TextListener>();
  private users = 0;
  private retry = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  status(): StatusInfo {
    return this.status_.get();
  }

  onStatus(cb: (info: StatusInfo) => void): () => void {
    return this.status_.on(cb);
  }

  onBinary(cb: BinaryListener): () => void {
    this.binary.add(cb);
    return () => this.binary.delete(cb);
  }

  onText(cb: TextListener): () => void {
    this.text.add(cb);
    return () => this.text.delete(cb);
  }

  send(data: string | ArrayBuffer): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    this.ws.send(data);
    return true;
  }

  acquire(): void {
    this.users++;
    if (this.users === 1) this.open();
  }

  release(): void {
    this.users = Math.max(0, this.users - 1);
    if (this.users > 0) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const ws = this.ws;
    this.ws = null;
    ws?.close();
    this.status_.set("idle");
  }

  private open(): void {
    this.status_.set(this.retry > 0 ? "reconnecting" : "connecting", this.url);
    let ws: WebSocket;
    try {
      ws = new WebSocket(this.url);
    } catch (err) {
      this.status_.set("error", `Bad WebSocket URL: ${String((err as Error).message)}`);
      return;
    }
    ws.binaryType = "arraybuffer";
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      this.status_.set("live", this.url);
    };
    ws.onmessage = (e: MessageEvent<ArrayBuffer | string>) => {
      if (typeof e.data === "string") for (const l of this.text) l(e.data);
      else for (const l of this.binary) l(e.data);
    };
    ws.onclose = () => {
      if (this.ws !== ws) return;
      this.ws = null;
      if (this.users === 0) return;
      const delay = RETRY_MS[Math.min(this.retry, RETRY_MS.length - 1)];
      this.retry++;
      this.status_.set("reconnecting", `Lost connection to ${this.url}; retrying`);
      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.users > 0) this.open();
      }, delay);
    };
  }
}

const links = new Map<string, WsLink>();

export function wsLink(url: string): WsLink {
  let link = links.get(url);
  if (!link) {
    link = new WsLink(url);
    links.set(url, link);
  }
  return link;
}
