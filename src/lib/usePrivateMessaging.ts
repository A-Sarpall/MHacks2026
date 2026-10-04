import { useCallback, useEffect, useRef, useState } from "react";
import { addContact as addContactOnHub, fetchContacts, sendPrivate, sendTapback, subscribeIncoming, type Contact, type IncomingMessage, type Tapback } from "./messages";
import { readAloud } from "./tts";

export interface Incoming extends IncomingMessage {
  reacted?: Tapback;
}


export function usePrivateMessaging() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [mode, setMode] = useState<"photon" | "dry-run" | "offline">("offline");
  const [target, setTarget] = useState<Contact | null>(null);
  const [targetIds, setTargetIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem("cue.contacts.selected.v1");
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return [];
    }
  });
  const [deliverTo, setDeliverToState] = useState<"speech" | "text">(() => {
    try {
      return localStorage.getItem("cue.deliver.v1") === "text" ? "text" : "speech";
    } catch {
      return "speech";
    }
  });
  const setDeliverTo = useCallback((mode: "speech" | "text") => {
    setDeliverToState(mode);
    try {
      localStorage.setItem("cue.deliver.v1", mode);
    } catch {
      return;
    }
  }, []);
  const [chosenOnce, setChosenOnce] = useState(() => {
    try {
      return localStorage.getItem("cue.contacts.selected.v1") !== null;
    } catch {
      return false;
    }
  });
  useEffect(() => {
    if (!chosenOnce) return;
    try {
      localStorage.setItem("cue.contacts.selected.v1", JSON.stringify(targetIds));
    } catch {
      return;
    }
  }, [targetIds, chosenOnce]);
  useEffect(() => {
    if (chosenOnce || contacts.length === 0) return;
    setTargetIds([contacts[0].id]);
    setChosenOnce(true);
  }, [contacts, chosenOnce]);
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

  const caretakers = contacts.filter((c) => targetIds.includes(c.id));
  const targets = deliverTo === "text" ? caretakers : [];
  const toggleTarget = useCallback((c: Contact) => {
    setChosenOnce(true);
    setTargetIds((ids) => (ids.includes(c.id) ? ids.filter((id) => id !== c.id) : [...ids, c.id]));
  }, []);
  const clearTargets = useCallback(() => {
    setChosenOnce(true);
    setTargetIds([]);
  }, []);
  const sendToTargets = useCallback(
    async (text: string): Promise<string[]> => {
      const list = contactsRef.current.filter((c) => targetIds.includes(c.id));
      if (list.length === 0) throw new Error("no caregiver chosen");
      await Promise.all(list.map((c) => sendPrivate(c.id, text)));
      return list.map((c) => c.name);
    },
    [targetIds]
  );
  const addContact = useCallback(
    async (name: string, phone: string): Promise<Contact> => {
      const c = await addContactOnHub(name, phone);
      await refresh();
      return c;
    },
    [refresh]
  );

  const fresh = incoming !== null && !incoming.reacted && incoming.contactId !== null;
  return {
    contacts,
    mode,
    target,
    setTarget,
    targets,
    caretakers,
    deliverTo,
    setDeliverTo,
    toggleTarget,
    clearTargets,
    sendToTargets,
    addContact,
    incoming,
    dismissIncoming: () => setIncoming(null),
    fresh,
    selectById,
    send,
    tap,
    refresh,
  };
}

export type PrivateMessaging = ReturnType<typeof usePrivateMessaging>;
