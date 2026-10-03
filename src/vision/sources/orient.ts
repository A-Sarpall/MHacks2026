export type Rotation = 0 | 90 | 180 | 270;

export interface Orientation {
  rotation: Rotation;
  mirror: boolean;
}

export type Hand = "right" | "left";

export const IDENTITY: Orientation = { rotation: 0, mirror: false };

export const HAND_PRESETS: Record<Hand, Orientation> = {
  right: { rotation: 0, mirror: false },
  left: { rotation: 180, mirror: false },
};

export const ROTATIONS: Rotation[] = [0, 90, 180, 270];

export function isIdentity(o: Orientation): boolean {
  return o.rotation === 0 && !o.mirror;
}

export function orientedSize(w: number, h: number, o: Orientation): { w: number; h: number } {
  return o.rotation === 90 || o.rotation === 270 ? { w: h, h: w } : { w, h };
}

export type Matrix = [number, number, number, number, number, number];

export function orientMatrix(w: number, h: number, o: Orientation): Matrix {
  const m = o.mirror ? -1 : 1;
  const mx = o.mirror ? w : 0;
  switch (o.rotation) {
    case 0:
      return [m, 0, 0, 1, mx, 0];
    case 90:
      return [0, m, -1, 0, h, mx];
    case 180:
      return [-m, 0, 0, -1, w - mx, h];
    case 270:
      return [0, -m, 1, 0, 0, w - mx];
  }
}

export function applyMatrix(mat: Matrix, x: number, y: number): { x: number; y: number } {
  const [a, b, c, d, e, f] = mat;
  return { x: a * x + c * y + e, y: b * x + d * y + f };
}

export function orientFrame(frame: ImageBitmap, o: Orientation): ImageBitmap {
  if (isIdentity(o)) return frame;
  const { w, h } = orientedSize(frame.width, frame.height, o);
  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext("2d");
  if (!ctx) return frame;
  ctx.setTransform(...orientMatrix(frame.width, frame.height, o));
  ctx.drawImage(frame, 0, 0);
  frame.close();
  return canvas.transferToImageBitmap();
}
