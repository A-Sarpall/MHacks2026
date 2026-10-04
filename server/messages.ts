// Private messaging (Photon Spectrum / iMessage). The core below is transport-agnostic and tested;
// `photonTransport` is the real iMessage side, `dryRunTransport` logs instead so everything works
// without credentials. Contacts are who the user can message privately; each has an unguessable id
// that is also what the contact's QR code (GET /q/<id>) encodes.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export type Tapback = "love" | "like" | "dislike" | "laugh" | "emphasize" | "question";
export const TAPBACKS: readonly Tapback[] = ["love", "like", "dislike", "laugh", "emphasize", "question"];
export const isTapback = (v: unknown): v is Tapback => typeof v === "string" && (TAPBACKS as readonly string[]).includes(v);

export interface Contact {
  id: string;
  name: string;
  phone: string; // E.164
}

export interface Inbound {
  phone: string;
  text: string;
  react?: (kind: Tapback) => Promise<void>;
}

export interface Transport {
  readonly mode: "photon" | "dry-run";
  send(phone: string, text: string): Promise<void>;
  /** Called once; transport pushes every inbound text message. */
  listen(onInbound: (m: Inbound) => void): void;
}

export interface IncomingEvent {
  id: string;
  contactId: string | null;
  from: string;
  text: string;
  at: number;
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length >= 11 && digits.length <= 15 && raw.trim().startsWith("+")) return `+${digits}`;
  return null;
}

const CONTACTS_FILE = fileURLToPath(new URL("./contacts.json", import.meta.url));

export class Messaging {
  readonly contacts = new Map<string, Contact>();
  private lastInbound = new Map<string, Inbound>(); // by phone
  private subs = new Set<(e: IncomingEvent) => void>();
  readonly outbox: { to: string; text: string }[] = [];

  constructor(
    readonly transport: Transport,
    private persistTo: string | null = CONTACTS_FILE,
  ) {
    if (persistTo && existsSync(persistTo)) {
      for (const c of JSON.parse(readFileSync(persistTo, "utf8")) as Contact[]) this.contacts.set(c.id, c);
    }
    transport.listen((m) => this.onInbound(m));
  }

  addContact(name: string, rawPhone: string): Contact {
    const phone = normalizePhone(rawPhone);
    if (!name.trim() || !phone) throw new Error("need a name and a valid phone number");
    const existing = [...this.contacts.values()].find((c) => c.phone === phone);
    if (existing) return existing;
    const c = { id: `c_${randomBytes(6).toString("hex")}`, name: name.trim(), phone };
    this.contacts.set(c.id, c);
    if (this.persistTo) writeFileSync(this.persistTo, JSON.stringify([...this.contacts.values()], null, 2));
    return c;
  }

  private byPhone(phone: string): Contact | undefined {
    const tail = phone.replace(/\D/g, "").slice(-10);
    return [...this.contacts.values()].find((c) => c.phone.replace(/\D/g, "").slice(-10) === tail);
  }

  async sendTo(contactId: string, text: string): Promise<Contact> {
    const c = this.contacts.get(contactId);
    if (!c) throw new Error("unknown contact");
    if (!text.trim() || text.length > 1000) throw new Error("text must be 1-1000 characters");
    this.outbox.push({ to: c.id, text });
    await this.transport.send(c.phone, text);
    return c;
  }

  async tapback(contactId: string, kind: Tapback): Promise<boolean> {
    const c = this.contacts.get(contactId);
    const last = c && this.lastInbound.get(c.phone);
    if (!last?.react) return false;
    await last.react(kind);
    return true;
  }

  private onInbound(m: Inbound): void {
    const c = this.byPhone(m.phone);
    console.log(`[messages] inbound from ${c?.name ?? "unknown sender …" + m.phone.slice(-4)} (${m.text.length} chars)`);
    if (c) this.lastInbound.set(c.phone, m);
    const e: IncomingEvent = { id: randomBytes(4).toString("hex"), contactId: c?.id ?? null, from: c?.name ?? m.phone, text: m.text, at: Date.now() };
    for (const s of this.subs) s(e);
  }

  /** Test/demo helper: pretend `from` texted the user. Only meaningful in dry-run mode. */
  simulateInbound(contactId: string, text: string): void {
    const c = this.contacts.get(contactId);
    if (!c) throw new Error("unknown contact");
    this.onInbound({ phone: c.phone, text, react: async (k) => void console.log(`[messages] (dry-run) tapback ${k} -> ${c.name}`) });
  }

  /** Put a message in front of the user (read aloud + card) without iMessage: used by the care agents.
   *  `from` matching a contact's name makes tapbacks possible; anything else (e.g. "Qu") is a plain notice. */
  deliver(from: string, text: string): number {
    const c = [...this.contacts.values()].find((x) => x.name.toLowerCase() === from.toLowerCase());
    const e: IncomingEvent = { id: randomBytes(4).toString("hex"), contactId: c?.id ?? null, from: c?.name ?? from, text, at: Date.now() };
    for (const s of this.subs) s(e);
    return this.subs.size;
  }

  subscribe(cb: (e: IncomingEvent) => void): () => void {
    this.subs.add(cb);
    return () => this.subs.delete(cb);
  }
}

export function dryRunTransport(): Transport {
  return {
    mode: "dry-run",
    async send(phone, text) {
      console.log(`[messages] (dry-run) iMessage to ${phone}: ${text}`);
    },
    listen() {},
  };
}

/** Real iMessage through Photon Spectrum cloud mode. Needs SPECTRUM_PROJECT_ID + SPECTRUM_PROJECT_SECRET. */
export async function photonTransport(): Promise<Transport> {
  const { Spectrum, Emoji } = await import("spectrum-ts");
  const { imessage } = await import("spectrum-ts/providers/imessage");
  const app = await Spectrum({
    projectId: process.env.SPECTRUM_PROJECT_ID!,
    projectSecret: process.env.SPECTRUM_PROJECT_SECRET!,
    providers: [imessage.config()],
  });
  const im = imessage(app);
  const dms = new Map<string, Awaited<ReturnType<typeof im.space.create>>>();

  return {
    mode: "photon",
    async send(phone, text) {
      let dm = dms.get(phone);
      if (!dm) {
        dm = await im.space.create(await im.user(phone));
        dms.set(phone, dm);
      }
      await dm.send(text);
    },
    listen(onInbound) {
      void (async () => {
        for await (const [, message] of app.messages) {
          if (message.direction === "outbound" || message.content.type !== "text") continue;
          const phone = message.sender?.id;
          if (!phone) continue;
          onInbound({
            phone,
            text: message.content.text,
            react: async (kind) => void (await message.react(Emoji[kind])),
          });
        }
      })().catch((err) => console.error("[messages] inbound loop ended:", err));
    },
  };
}

export async function createMessaging(): Promise<Messaging> {
  const creds = process.env.SPECTRUM_PROJECT_ID && process.env.SPECTRUM_PROJECT_SECRET;
  let transport: Transport;
  if (creds) {
    try {
      transport = await photonTransport();
    } catch (err) {
      console.warn("[messages] Photon failed to start, using dry-run:", (err as Error).message);
      transport = dryRunTransport();
    }
  } else {
    console.log("[messages] no SPECTRUM_PROJECT_ID/SECRET: dry-run mode (messages are logged, not sent)");
    transport = dryRunTransport();
  }
  const m = new Messaging(transport);
  // Seed from env, e.g. QU_CONTACTS="Maya:+15551234567,Dr. Patel:+15557654321"
  for (const part of (process.env.QU_CONTACTS ?? "").split(",").filter(Boolean)) {
    const [name, phone] = part.split(":");
    try {
      m.addContact(name, phone ?? "");
    } catch {
      console.warn(`[messages] bad QU_CONTACTS entry: ${part}`);
    }
  }
  return m;
}
