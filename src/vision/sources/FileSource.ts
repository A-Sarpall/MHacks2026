import { StatusEmitter, sleep, type FrameSource, type StatusInfo } from "./types";

export type FileInput = Blob | string;
export type FileItem = FileInput | FileInput[];

export interface BurstSimulation {
  wakeFrames: number;
  wakeMs: number;
  frameMs: number;
  shake: number;
}

export const NO_SIMULATION: BurstSimulation = { wakeFrames: 0, wakeMs: 0, frameMs: 0, shake: 0 };

export const SHAKE_PATTERN = [1, 0.6, 0.15, 0, 0.3];

export class FileSource implements FrameSource {
  readonly kind = "file" as const;
  readonly label = "Image files";
  readonly mode = "still" as const;
  private status_ = new StatusEmitter();
  private items: FileItem[];
  private index = 0;
  private sim: BurstSimulation;

  constructor(items: FileItem[] = [], sim: BurstSimulation = NO_SIMULATION) {
    this.items = [...items];
    this.sim = sim;
  }

  status(): StatusInfo {
    return this.status_.get();
  }

  onStatus(cb: (info: StatusInfo) => void): () => void {
    return this.status_.on(cb);
  }

  async start(): Promise<void> {
    this.status_.set("live", this.describe());
  }

  stop(): void {
    this.status_.set("idle");
  }

  setItems(items: FileItem[]): void {
    this.items = [...items];
    this.index = 0;
    this.status_.set("live", this.describe());
  }

  setSimulation(sim: BurstSimulation): void {
    this.sim = sim;
  }

  count(): number {
    return this.items.length;
  }

  async pick(): Promise<void> {
    const files = await pickImageFiles();
    if (files.length) this.setItems(files);
  }

  async load(item: FileInput): Promise<ImageBitmap> {
    const blob = typeof item === "string" ? await fetchBlob(item) : item;
    return createImageBitmap(blob);
  }

  async capture(): Promise<ImageBitmap> {
    const [first, ...rest] = await this.captureBurst(1);
    rest.forEach((f) => f.close());
    return first;
  }

  async captureBurst(count: number): Promise<ImageBitmap[]> {
    if (this.items.length === 0) await this.pick();
    if (this.items.length === 0) throw new Error("No image chosen");
    const item = this.items[this.index % this.items.length];
    this.index++;
    this.status_.set("live", this.describe());
    const n = Math.max(1, count);
    if (this.sim.wakeMs > 0) await sleep(this.sim.wakeMs);
    if (Array.isArray(item)) {
      const out: ImageBitmap[] = [];
      for (const g of item.slice(0, n)) {
        if (this.sim.frameMs > 0) await sleep(this.sim.frameMs);
        out.push(await this.load(g));
      }
      return out;
    }
    const base = await this.load(item);
    const out: ImageBitmap[] = [];
    for (let i = 0; i < n; i++) {
      if (this.sim.frameMs > 0) await sleep(this.sim.frameMs);
      out.push(simulateFrame(base, i, this.sim));
    }
    base.close();
    return out;
  }

  private describe(): string {
    if (this.items.length === 0) return "Press the button to choose images";
    return `Image ${(this.index % this.items.length) + 1} of ${this.items.length} next`;
  }
}

export function simulateFrame(base: ImageBitmap, i: number, sim: BurstSimulation): ImageBitmap {
  const c = new OffscreenCanvas(base.width, base.height);
  const ctx = c.getContext("2d")!;
  const filters: string[] = [];
  if (i < sim.wakeFrames) filters.push("brightness(0.3) sepia(0.7) hue-rotate(35deg) contrast(0.7)");
  const blur = sim.shake * SHAKE_PATTERN[(i - sim.wakeFrames + SHAKE_PATTERN.length * 10) % SHAKE_PATTERN.length];
  if (blur > 0) filters.push(`blur(${(blur * base.width) / 160}px)`);
  ctx.filter = filters.join(" ") || "none";
  ctx.drawImage(base, 0, 0);
  return c.transferToImageBitmap();
}

async function fetchBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Could not load ${url}: HTTP ${res.status}`);
  return res.blob();
}

export function pickImageFiles(): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.addEventListener("change", () => resolve(Array.from(input.files ?? [])));
    input.addEventListener("cancel", () => resolve([]));
    input.click();
  });
}
