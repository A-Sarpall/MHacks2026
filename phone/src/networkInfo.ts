// What the phone says about its own network, in words. Pure, so it is unit-tested.
// The ring's Wi-Fi hands out 192.168.4.x addresses, so the phone's own address says whether it is really on it.

export interface NetSnapshot {
  type: string; // WIFI | CELLULAR | NONE | UNKNOWN ...
  ip: string;
  internet: boolean | undefined;
  airplane?: boolean;
}

export const RING_SUBNET = '192.168.4.';

export function describeNetwork(n: NetSnapshot): { text: string; onRing: boolean } {
  const onRing = n.type === 'WIFI' && n.ip.startsWith(RING_SUBNET);
  if (n.airplane) return { text: 'Airplane mode is ON: turn it off.', onRing: false };
  if (n.type === 'NONE') return { text: 'No network at all. Join Qu-Ring in Settings → Wi-Fi.', onRing: false };
  const base = `${n.type.toLowerCase()} · ${n.ip || 'no address'} · internet: ${n.internet === undefined ? '?' : n.internet ? 'yes' : 'no'}`;
  if (onRing) return { text: `${base}\nOn the ring's Wi-Fi (Qu-Ring).`, onRing };
  if (n.type === 'WIFI') return { text: `${base}\nNOT on Qu-Ring (its addresses start 192.168.4.). Join Qu-Ring in Settings → Wi-Fi.`, onRing };
  return { text: `${base}\nOn cellular, not Wi-Fi: the ring is not reachable. Join Qu-Ring in Settings → Wi-Fi.`, onRing };
}
