/// <reference types="web-bluetooth" />
import { StatusEmitter, type StatusInfo } from "./types";

export const RING_BLE = {
  service: "6e400001-c0e0-4c0e-a000-00000000c0e0",
  imageControl: "6e400002-c0e0-4c0e-a000-00000000c0e0",
  imageData: "6e400003-c0e0-4c0e-a000-00000000c0e0",
  button: "6e400004-c0e0-4c0e-a000-00000000c0e0",
  feedback: "6e400005-c0e0-4c0e-a000-00000000c0e0",
  namePrefix: "Cue",
  isPlaceholder: true,
} as const;

export const BLE_CMD_CAPTURE = 0x01;
export const BLE_PKT_START = 0xa0;
export const BLE_PKT_DATA = 0xa1;
export const BLE_PKT_END = 0xa2;

const RETRY_MS = [500, 1000, 2000, 4000];

type CharListener = (value: DataView) => void;

export class BleLink {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private chars = new Map<string, BluetoothRemoteGATTCharacteristic>();
  private listeners = new Map<string, Set<CharListener>>();
  private status_ = new StatusEmitter();
  private users = 0;
  private retry = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;

  status(): StatusInfo {
    return this.status_.get();
  }

  onStatus(cb: (info: StatusInfo) => void): () => void {
    return this.status_.on(cb);
  }

  supported(): boolean {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  acquire(): void {
    this.users++;
    if (this.users > 1) return;
    if (!this.supported()) {
      this.status_.set("error", "Web Bluetooth is not available in this browser (use Chrome or Edge).");
      return;
    }
    if (this.device) void this.connect();
    else void this.restore();
  }

  release(): void {
    this.users = Math.max(0, this.users - 1);
    if (this.users > 0) return;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.server?.disconnect();
    this.server = null;
    this.chars.clear();
    this.status_.set("idle");
  }

  async pair(): Promise<void> {
    if (!this.supported()) throw new Error("Web Bluetooth is not available in this browser.");
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: [RING_BLE.service] }, { namePrefix: RING_BLE.namePrefix }],
      optionalServices: [RING_BLE.service],
    });
    this.adopt(device);
    await this.connect();
  }

  on(characteristic: string, cb: CharListener): () => void {
    let set = this.listeners.get(characteristic);
    if (!set) {
      set = new Set();
      this.listeners.set(characteristic, set);
    }
    set.add(cb);
    return () => set.delete(cb);
  }

  async write(characteristic: string, bytes: number[]): Promise<boolean> {
    const c = this.chars.get(characteristic);
    if (!c) return false;
    try {
      await c.writeValueWithoutResponse(new Uint8Array(bytes));
      return true;
    } catch {
      try {
        await c.writeValue(new Uint8Array(bytes));
        return true;
      } catch {
        return false;
      }
    }
  }

  private async restore(): Promise<void> {
    const getDevices = navigator.bluetooth.getDevices?.bind(navigator.bluetooth);
    const known = getDevices ? await getDevices().catch(() => []) : [];
    const ring = known.find((d) => d.name?.startsWith(RING_BLE.namePrefix));
    if (ring) {
      this.adopt(ring);
      await this.connect();
      return;
    }
    this.status_.set("idle", "Press “Pair ring” to connect over Bluetooth");
  }

  private adopt(device: BluetoothDevice): void {
    if (this.device === device) return;
    this.device = device;
    device.addEventListener("gattserverdisconnected", () => {
      this.server = null;
      this.chars.clear();
      if (this.users === 0) return;
      this.status_.set("reconnecting", "Ring disconnected; reconnecting");
      this.scheduleRetry();
    });
  }

  private scheduleRetry(): void {
    const delay = RETRY_MS[Math.min(this.retry, RETRY_MS.length - 1)];
    this.retry++;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      if (this.users > 0) void this.connect();
    }, delay);
  }

  private async connect(): Promise<void> {
    const device = this.device;
    if (!device?.gatt) return;
    this.status_.set(this.retry > 0 ? "reconnecting" : "connecting", device.name ?? "ring");
    try {
      const server = await device.gatt.connect();
      const service = await server.getPrimaryService(RING_BLE.service);
      this.chars.clear();
      for (const uuid of [
        RING_BLE.imageControl,
        RING_BLE.imageData,
        RING_BLE.button,
        RING_BLE.feedback,
      ]) {
        const c = await service.getCharacteristic(uuid).catch(() => null);
        if (!c) continue;
        this.chars.set(uuid, c);
        if (c.properties.notify) {
          c.addEventListener("characteristicvaluechanged", () => {
            const v = c.value;
            if (!v) return;
            for (const l of this.listeners.get(uuid) ?? []) l(v);
          });
          await c.startNotifications();
        }
      }
      this.server = server;
      this.retry = 0;
      this.status_.set("live", device.name ?? "ring");
    } catch (err) {
      this.status_.set("reconnecting", `Bluetooth: ${String((err as Error).message ?? err)}`);
      this.scheduleRetry();
    }
  }
}

let shared: BleLink | null = null;

export function ringBle(): BleLink {
  shared ??= new BleLink();
  return shared;
}
