import { describe, expect, it, vi } from "vitest";
import { Messaging, normalizePhone, type Inbound, type Transport } from "./messages.ts";

function fake() {
  const sent: { phone: string; text: string }[] = [];
  let push: (m: Inbound) => void = () => {};
  const transport: Transport = {
    mode: "dry-run",
    async send(phone, text) {
      sent.push({ phone, text });
    },
    listen(cb) {
      push = cb;
    },
  };
  return { messaging: new Messaging(transport, null), sent, inbound: (m: Inbound) => push(m) };
}

describe("normalizePhone", () => {
  it("accepts common US and E.164 forms", () => {
    expect(normalizePhone("(734) 555-0100")).toBe("+17345550100");
    expect(normalizePhone("1 734 555 0100")).toBe("+17345550100");
    expect(normalizePhone("+44 20 7946 0958")).toBe("+442079460958");
  });
  it("rejects junk", () => {
    expect(normalizePhone("12345")).toBeNull();
    expect(normalizePhone("hello")).toBeNull();
  });
});

describe("Messaging", () => {
  it("adds contacts once per phone and never exposes via bad input", () => {
    const { messaging } = fake();
    const a = messaging.addContact("Maya", "734-555-0100");
    expect(messaging.addContact("Maya again", "+1 (734) 555-0100").id).toBe(a.id);
    expect(a.id).toMatch(/^c_[0-9a-f]{12}$/);
    expect(() => messaging.addContact("", "7345550100")).toThrow();
    expect(() => messaging.addContact("X", "123")).toThrow();
  });

  it("sends to the contact's phone", async () => {
    const { messaging, sent } = fake();
    const maya = messaging.addContact("Maya", "7345550100");
    await messaging.sendTo(maya.id, "I'm in pain, 6 out of 10.");
    expect(sent).toEqual([{ phone: "+17345550100", text: "I'm in pain, 6 out of 10." }]);
    await expect(messaging.sendTo("nope", "hi")).rejects.toThrow("unknown contact");
    await expect(messaging.sendTo(maya.id, "  ")).rejects.toThrow();
  });

  it("turns inbound texts into events for subscribers, matching the contact by phone", () => {
    const { messaging, inbound } = fake();
    const maya = messaging.addContact("Maya", "7345550100");
    const got = vi.fn();
    const off = messaging.subscribe(got);
    inbound({ phone: "+1 734 555 0100", text: "I'll be there at 5" });
    inbound({ phone: "+19995550000", text: "who dis" });
    off();
    inbound({ phone: "+17345550100", text: "ignored after unsubscribe" });
    expect(got).toHaveBeenCalledTimes(2);
    expect(got.mock.calls[0][0]).toMatchObject({ contactId: maya.id, from: "Maya", text: "I'll be there at 5" });
    expect(got.mock.calls[1][0]).toMatchObject({ contactId: null, from: "+19995550000" });
  });

  it("reacts to the contact's latest message", async () => {
    const { messaging, inbound } = fake();
    const maya = messaging.addContact("Maya", "7345550100");
    expect(await messaging.tapback(maya.id, "like")).toBe(false); // nothing to react to yet
    const react = vi.fn(async () => {});
    inbound({ phone: "+17345550100", text: "Dinner at 6?", react });
    expect(await messaging.tapback(maya.id, "like")).toBe(true);
    expect(react).toHaveBeenCalledWith("like");
  });
});
