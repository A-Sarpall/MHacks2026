// A contact holds up their phone showing the QR from the hub's GET /q/<id> page; the ring camera reads it.
// Payload is "qu:<contactId>". Pure so it can be tested without a canvas.
import jsQR from "jsqr";

export const QR_PREFIX = "qu:";

export function contactIdFromQr(data: Uint8ClampedArray, width: number, height: number): string | null {
  const code = jsQR(data, width, height, { inversionAttempts: "attemptBoth" });
  return code?.data.startsWith(QR_PREFIX) ? code.data.slice(QR_PREFIX.length) : null;
}

export function readContactQr(canvas: HTMLCanvasElement): string | null {
  // Downscale big frames: QR codes are large in a "hold it up to the camera" shot, and this keeps it fast.
  const scale = Math.min(1, 800 / Math.max(canvas.width, canvas.height));
  const w = Math.max(1, Math.round(canvas.width * scale));
  const h = Math.max(1, Math.round(canvas.height * scale));
  const small = document.createElement("canvas");
  small.width = w;
  small.height = h;
  const ctx = small.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(canvas, 0, 0, w, h);
  return contactIdFromQr(ctx.getImageData(0, 0, w, h).data, w, h);
}
