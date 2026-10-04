// HTTP routes for private messaging. Returns true when the request was handled.
//   GET  /messages/status              mode + contacts (ids and names only; phone numbers stay on the hub)
//   POST /messages/contacts            {name, phone} -> contact
//   POST /messages/send                {to: contactId, text}
//   POST /messages/tapback             {to: contactId, kind: love|like|dislike|laugh|emphasize|question}
//   GET  /messages/stream              server-sent events: every inbound text
//   POST /messages/dev/incoming        {to: contactId, text}  dry-run only: simulate a text from that contact
//   GET  /q/<contactId>                page for the contact to open on their phone: a QR code the ring camera reads
import type { IncomingMessage, ServerResponse } from "node:http";
import { networkInterfaces } from "node:os";
import QRCode from "qrcode";
import { CORS, readJson, send } from "./http.ts";
import { isTapback, type Messaging } from "./messages.ts";

export const QR_PREFIX = "qu:";

export function publicBase(port: number): string {
  if (process.env.HUB_PUBLIC_URL) return process.env.HUB_PUBLIC_URL.replace(/\/$/, "");
  for (const addrs of Object.values(networkInterfaces()))
    for (const a of addrs ?? []) if (a.family === "IPv4" && !a.internal) return `http://${a.address}:${port}`;
  return `http://localhost:${port}`;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

async function qrPage(name: string, id: string): Promise<string> {
  const svg = await QRCode.toString(QR_PREFIX + id, { type: "svg", margin: 2, errorCorrectionLevel: "M" });
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Message ${esc(name)} privately</title>
<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;font-family:system-ui,sans-serif;background:#fff;color:#15171c;text-align:center;padding:24px}
.qr{width:min(80vw,420px)}.qr svg{width:100%;height:auto;display:block}h1{margin:0;font-size:28px}p{margin:0;font-size:18px;color:#4a505b;max-width:30ch}</style></head>
<body><h1>${esc(name)}</h1><div class="qr">${svg}</div><p>Hold this up so the Qu ring can see it. Messages you get will appear on their phone as private texts.</p></body></html>`;
}

export async function messageRoutes(req: IncomingMessage, res: ServerResponse, url: URL, m: Messaging, port: number): Promise<boolean> {
  const { pathname } = url;

  if (req.method === "GET" && pathname === "/messages/status") {
    const base = publicBase(port);
    send(res, 200, {
      mode: m.transport.mode,
      contacts: [...m.contacts.values()].map((c) => ({ id: c.id, name: c.name, shareUrl: `${base}/q/${c.id}` })),
    });
    return true;
  }

  // Dry-run only: what the hub "sent", so tests and demos can see it.
  if (req.method === "GET" && pathname === "/messages/outbox") {
    if (m.transport.mode !== "dry-run") send(res, 403, { error: "only available in dry-run mode" });
    else send(res, 200, { outbox: m.outbox.map((o) => ({ to: m.contacts.get(o.to)?.name ?? o.to, text: o.text })) });
    return true;
  }

  if (req.method === "GET" && pathname.startsWith("/q/")) {
    const c = m.contacts.get(pathname.slice(3));
    if (!c) {
      send(res, 404, { error: "unknown contact" });
      return true;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(await qrPage(c.name, c.id));
    return true;
  }

  if (req.method === "GET" && pathname === "/messages/stream") {
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-store", Connection: "keep-alive", ...CORS });
    res.write(": connected\n\n");
    const off = m.subscribe((e) => res.write(`data: ${JSON.stringify(e)}\n\n`));
    const beat = setInterval(() => res.write(": ping\n\n"), 20_000);
    req.on("close", () => {
      off();
      clearInterval(beat);
    });
    return true;
  }

  if (req.method !== "POST" || !pathname.startsWith("/messages/")) return false;
  try {
    const body = (await readJson(req)) as Record<string, unknown>;
    const to = typeof body.to === "string" ? body.to : "";

    if (pathname === "/messages/contacts") {
      const c = m.addContact(String(body.name ?? ""), String(body.phone ?? ""));
      send(res, 200, { id: c.id, name: c.name, shareUrl: `${publicBase(port)}/q/${c.id}` });
    } else if (pathname === "/messages/send") {
      const c = await m.sendTo(to, String(body.text ?? ""));
      send(res, 200, { sent: true, to: c.name, mode: m.transport.mode });
    } else if (pathname === "/messages/tapback") {
      if (!isTapback(body.kind)) {
        send(res, 400, { error: "kind must be love, like, dislike, laugh, emphasize or question" });
        return true;
      }
      const ok = await m.tapback(to, body.kind);
      send(res, ok ? 200 : 404, ok ? { sent: true } : { error: "no recent message from that contact to react to" });
    } else if (pathname === "/messages/dev/incoming") {
      if (m.transport.mode !== "dry-run") {
        send(res, 403, { error: "only available in dry-run mode" });
        return true;
      }
      m.simulateInbound(to, String(body.text ?? ""));
      send(res, 200, { simulated: true });
    } else return false;
  } catch (err) {
    send(res, 400, { error: (err as Error).message });
  }
  return true;
}
