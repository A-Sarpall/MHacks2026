// "What the ring saw", sent by the web app on the laptop in phone-screen mode (src/lib/phoneUi.ts there).
// Validated here because it arrives over the network.

export interface DetectedOption {
  label: string;
  score: number;
  thumbnail?: string;
}

export interface Detected {
  id: string;
  status: 'named' | 'unsure' | 'none';
  label: string | null;
  options: DetectedOption[];
  hint?: string;
}

const STATUSES = new Set(['named', 'unsure', 'none']);

export function parseDetected(m: Record<string, unknown>): Detected | null {
  if (m.type !== 'detected' || typeof m.status !== 'string' || !STATUSES.has(m.status)) return null;
  const options: DetectedOption[] = Array.isArray(m.options)
    ? m.options
        .filter((o): o is Record<string, unknown> => !!o && typeof o === 'object' && typeof (o as { label?: unknown }).label === 'string')
        .map((o) => ({
          label: String(o.label).trim(),
          score: typeof o.score === 'number' ? o.score : 0,
          ...(typeof o.thumbnail === 'string' && o.thumbnail.startsWith('data:image/') ? { thumbnail: o.thumbnail } : {}),
        }))
        .filter((o) => o.label)
        .slice(0, 6)
    : [];
  const status = m.status as Detected['status'];
  const label = status === 'named' ? (typeof m.label === 'string' && m.label.trim() ? m.label.trim() : options[0]?.label ?? null) : null;
  if (status === 'named' && !label) return null;
  return {
    id: typeof m.id === 'string' ? m.id : String(Date.now()),
    status,
    label,
    options,
    ...(typeof m.hint === 'string' && m.hint ? { hint: m.hint } : {}),
  };
}
