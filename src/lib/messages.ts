// Private messaging client for the hub (server/messages.ts). Phone numbers never reach the browser:
// contacts are {id, name}; the id is also what their QR code carries.
import { HUB } from "./hub";

export type Tapback = "love" | "like" | "dislike" | "laugh" | "emphasize" | "question";
export const TAPBACK_EMOJI: Record<Tapback, string> = { love: "❤️", like: "👍", dislike: "👎", laugh: "😂", emphasize: "‼️", question: "❓" };

export interface Contact {
  id: string;
  name: string;
  shareUrl: string;
}
export interface IncomingMessage {
  id: string;
  contactId: string | null;
  from: string;
  text: string;
  at: number;
}

async function call<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${HUB}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
  });
  const json = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(json.error ?? `hub ${res.status}`);
  return json;
}

export const fetchContacts = () => call<{ mode: "photon" | "dry-run"; contacts: Contact[] }>("/messages/status");
export const sendPrivate = (to: string, text: string) => call<{ sent: true; to: string; mode: string }>("/messages/send", { to, text });
export const sendTapback = (to: string, kind: Tapback) => call<{ sent: true }>("/messages/tapback", { to, kind });

/** Live inbound texts. Returns an unsubscribe function. EventSource reconnects by itself. */
export function subscribeIncoming(onMessage: (m: IncomingMessage) => void): () => void {
  const es = new EventSource(`${HUB}/messages/stream`);
  es.onmessage = (e) => onMessage(JSON.parse(e.data as string) as IncomingMessage);
  return () => es.close();
}
