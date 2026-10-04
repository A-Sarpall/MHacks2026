import { startInputListening, stopInputListening } from "../../lib/input";
import type { InputAction } from "../../lib/types";
import { RING_BLE, ringBle } from "../sources/bleLink";
import type { StatusInfo } from "../sources/types";
import { wsLink, type WsLink } from "../sources/wsLink";
import { BUTTON_BYTES, FEEDBACK_CODES, parseButtonMessage, type ButtonInput, type FeedbackKind } from "./types";

export class KeyboardInput implements ButtonInput {
  readonly id = "keyboard";
  readonly label = "Keyboard (Space / D / H)";

  start(handler: (action: InputAction) => void): void {
    startInputListening(handler);
  }

  stop(): void {
    stopInputListening();
  }
}

export class WsButtonInput implements ButtonInput {
  readonly id = "ws-button";
  readonly label = "Ring button (Wi-Fi)";
  private link: WsLink;
  private unsubs: (() => void)[] = [];
  private held = false;

  constructor(url: string) {
    this.link = wsLink(url);
  }

  start(handler: (action: InputAction) => void): void {
    if (this.held) return;
    this.unsubs.push(
      this.link.onText((text) => {
        const action = parseButtonMessage(text);
        if (action) handler(action);
      })
    );
    this.held = true;
    this.link.acquire();
  }

  stop(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    if (this.held) this.link.release();
    this.held = false;
  }

  status(): StatusInfo {
    return this.link.status();
  }

  onStatus(cb: (info: StatusInfo) => void): () => void {
    return this.link.onStatus(cb);
  }

  feedback(kind: FeedbackKind): void {
    this.link.send(JSON.stringify({ type: "feedback", kind }));
  }
}

export class BleButtonInput implements ButtonInput {
  readonly id = "ble-button";
  readonly label = "Ring button (Bluetooth)";
  private link = ringBle();
  private unsubs: (() => void)[] = [];
  private held = false;

  start(handler: (action: InputAction) => void): void {
    if (this.held) return;
    this.unsubs.push(
      this.link.on(RING_BLE.button, (v) => {
        const action = v.byteLength > 0 ? BUTTON_BYTES[v.getUint8(0)] : undefined;
        if (action) handler(action);
      })
    );
    this.held = true;
    this.link.acquire();
  }

  stop(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    if (this.held) this.link.release();
    this.held = false;
  }

  status(): StatusInfo {
    return this.link.status();
  }

  onStatus(cb: (info: StatusInfo) => void): () => void {
    return this.link.onStatus(cb);
  }

  feedback(kind: FeedbackKind): void {
    void this.link.write(RING_BLE.feedback, [FEEDBACK_CODES[kind]]);
  }

  pair(): Promise<void> {
    return this.link.pair();
  }
}
