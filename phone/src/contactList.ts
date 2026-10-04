// Turning the phone's address book into rows to pick from. Pure (no React Native imports) so it is unit-tested.

export interface DevicePhone {
  number?: string | null;
  label?: string | null;
}

export interface DeviceContact {
  givenName?: string | null;
  familyName?: string | null;
  phones?: DevicePhone[] | null;
}

/** One pickable row: one person's one number (a person with two numbers gets two rows). */
export interface Candidate {
  key: string;
  name: string;
  number: string;
  label: string;
}

const digits = (s: string) => s.replace(/\D/g, '');

/** Flatten, drop numbers too short to be real, and drop the same number listed twice. Sorted by name. */
export function toCandidates(contacts: DeviceContact[]): Candidate[] {
  const seen = new Set<string>();
  const out: Candidate[] = [];
  for (const c of contacts) {
    const name = [c.givenName, c.familyName].filter(Boolean).join(' ').trim() || 'No name';
    for (const p of c.phones ?? []) {
      const number = (p.number ?? '').trim();
      const d = digits(number);
      if (d.length < 7) continue;
      const id = d.slice(-10); // same person in two formats: "(954) 892-4459" and "+1 954 892 4459"
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ key: `${id}:${name}`, name, number, label: (p.label ?? '').trim() });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

export function filterCandidates(list: Candidate[], query: string): Candidate[] {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  const qd = digits(q);
  return list.filter((c) => c.name.toLowerCase().includes(q) || (qd.length >= 3 && digits(c.number).includes(qd)));
}

/** The hub's HTTP address from the address typed into the app: wss://host/phone -> https://host. */
export function hubHttpUrl(wsUrl: string): string {
  return wsUrl.trim().replace(/^ws(s?):\/\//i, (_m, s: string) => `http${s.toLowerCase()}://`).replace(/\/phone\/?$/i, '').replace(/\/$/, '');
}
