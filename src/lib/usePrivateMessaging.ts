import { useCallback, useEffect, useRef, useState } from "react";
import { fetchContacts, sendPrivate, sendTapback, subscribeIncoming, type Contact, type IncomingMessage, type Tapback } from "./messages";
import { readAloud } from "./tts";

export interface Incoming extends IncomingMessage {
  reacted?: Tapback;
}

const FRESH_MS = 60_000; // a text counts as "just arrived" (ring double-click = tapback) for this long

export function usePrivateMessaging() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mode, setMode] = useState<"photon" | "dry-run" | "offline">("offline");
  const [target, setTarget] = useState<Contact | null>(null);
  const [incoming, setIncoming] = useState<Incoming | null>(null);
  const contactsRef = useRef(contacts);
  contactsRef.current = contacts;

  const refresh = useCallback(async (): Promise<Contact[]> => {
    try {
      const r = await fetchContacts();
      setContacts(r.contacts);
      setMode(r.mode);
      return r.contacts;
    } catch {
      setMode("offline");
      return contactsRef.current;
    }
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeIncoming((m) => {
      setIncoming(m);
      void refresh(); // a new sender may have been added on the hub
      readAloud(m.from === "Qu" ? m.text : `${m.from} says: ${m.text}`).catch(() => {});
    });
  }, [refresh]);

  /** A contact's QR code was read: make them the private target. Returns their name, or null if unknown. */
  const selectById = useCallback(
    async (id: string): Promise<string | null> => {
      const c = contactsRef.current.find((x) => x.id === id) ?? (await refresh()).find((x) => x.id === id);
      if (!c) return null;
      setTarget(c);
      return c.name;
    },
    [refresh]
  );

  const send = useCallback(
    async (text: string): Promise<string> => {
      if (!target) throw new Error("no private contact selected");
      await sendPrivate(target.id, text);
      setTarget(null); // one-shot: the next sentence is spoken aloud again
      return target.name;
    },
    [target]
  );

  const tap = useCallback(
    async (kind: Tapback): Promise<string | null> => {
      if (!incoming?.contactId) return null;
      await sendTapback(incoming.contactId, kind);
      setIncoming({ ...incoming, reacted: kind });
      return incoming.from;
    },
    [incoming]
  );

  const fresh = incoming !== null && !incoming.reacted && incoming.contactId !== null && Date.now() - incoming.at < FRESH_MS;
  return { contacts, mode, target, setTarget, incoming, dismissIncoming: () => setIncoming(null), fresh, selectById, send, tap, refresh };
}

export type PrivateMessaging = ReturnType<typeof usePrivateMessaging>;
