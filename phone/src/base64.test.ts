import { describe, expect, it } from 'vitest';
import { bytesToBase64 } from './base64';

const enc = (s: string) => bytesToBase64(new TextEncoder().encode(s).buffer as ArrayBuffer);

describe('bytesToBase64', () => {
  it('matches the standard encoding for every padding length', () => {
    for (const s of ['', 'f', 'fo', 'foo', 'foob', 'fooba', 'foobar']) {
      expect(enc(s)).toBe(Buffer.from(s).toString('base64'));
    }
  });
  it('encodes all byte values, as in a JPEG', () => {
    const all = new Uint8Array(256).map((_, i) => i);
    expect(bytesToBase64(all.buffer as ArrayBuffer)).toBe(Buffer.from(all).toString('base64'));
    const jpegHead = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(bytesToBase64(jpegHead.buffer as ArrayBuffer)).toBe('/9j/4AAQ');
  });
});
