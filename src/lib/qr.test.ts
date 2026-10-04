import QRCode from "qrcode";
import { describe, expect, it } from "vitest";
import { contactIdFromQr } from "./qr";

// Render a QR into RGBA pixels (black modules on white, quiet zone included, 8 px per module).
function render(text: string) {
  const qr = QRCode.create(text, { errorCorrectionLevel: "M" });
  const n = qr.modules.size, scale = 8, quiet = 4, size = (n + quiet * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const mx = Math.floor(x / scale) - quiet, my = Math.floor(y / scale) - quiet;
      if (mx >= 0 && my >= 0 && mx < n && my < n && qr.modules.get(mx, my)) {
        const i = (y * size + x) * 4;
        data[i] = data[i + 1] = data[i + 2] = 0;
      }
    }
  return { data, size };
}

describe("contactIdFromQr", () => {
  it("reads a Qu contact code", () => {
    const { data, size } = render("qu:c_05d24209b034");
    expect(contactIdFromQr(data, size, size)).toBe("c_05d24209b034");
  });
  it("ignores QR codes that are not Qu's", () => {
    const { data, size } = render("https://example.com");
    expect(contactIdFromQr(data, size, size)).toBeNull();
  });
  it("returns null when there is no QR code", () => {
    expect(contactIdFromQr(new Uint8ClampedArray(100 * 100 * 4).fill(200), 100, 100)).toBeNull();
  });
});
