import { StatusEmitter, type FrameSource, type StatusInfo } from "./types";

export type FileInput = Blob | string;
export type FileItem = FileInput | FileInput[];

export class FileSource implements FrameSource {
  readonly kind = "file" as const;
  readonly label = "Image files";
  readonly mode = "still" as const;
  private status_ = new StatusEmitter();
  private items: FileItem[];
  private index = 0;

  constructor(items: FileItem[] = []) {
    this.items = [...items];
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
    const group = Array.isArray(item) ? item.slice(0, Math.max(1, count)) : [item];
    return Promise.all(group.map((g) => this.load(g)));
  }

  private describe(): string {
    if (this.items.length === 0) return "Press the button to choose images";
    return `Image ${(this.index % this.items.length) + 1} of ${this.items.length} next`;
  }
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
