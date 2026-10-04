// JPEG bytes -> base64, for showing the ring's picture in an <Image>. Pure, so it is unit-tested.
const ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export function bytesToBase64(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  let out = '';
  for (let i = 0; i < b.length; i += 3) {
    const n = (b[i] << 16) | ((b[i + 1] ?? 0) << 8) | (b[i + 2] ?? 0);
    out += ABC[(n >> 18) & 63] + ABC[(n >> 12) & 63];
    out += i + 1 < b.length ? ABC[(n >> 6) & 63] : '=';
    out += i + 2 < b.length ? ABC[n & 63] : '=';
  }
  return out;
}
