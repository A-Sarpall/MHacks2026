// Routes the Python care agents (agents/) and the browser use.
//   POST /care/pain        {level?: 1-10}       the user reported pain (browser) -> queued for the Care agent
//   GET  /care/next                             Care agent polls: {event: {id, level, at} | null}
//   GET  /care/summary                          everything the Care agent needs for "How's Dad doing?"
//   POST /care/say         {from, text}         read aloud to the user + show a card (caregiver message or Qu notice)
//   POST /care/log         {text}               the browser logs each sentence the user spoke aloud
//   POST /care/taken       {name}               mark an as-needed or regular medicine as just taken
import type { IncomingMessage, ServerResponse } from "node:http";
import type { CareState } from "./care.ts";
import { loadProfile } from "./finch.ts";
import { readJson, send } from "./http.ts";
import type { Messaging } from "./messages.ts";

export async function careRoutes(req: IncomingMessage, res: ServerResponse, url: URL, care: CareState, m: Messaging): Promise<boolean> {
  const { pathname } = url;
  if (!pathname.startsWith("/care/")) return false;

  try {
    if (req.method === "GET" && pathname === "/care/next") {
      send(res, 200, { event: care.nextPain() });
    } else if (req.method === "GET" && pathname === "/care/summary") {
      send(res, 200, care.summary(await loadProfile()));
    } else if (req.method === "POST") {
      const body = (await readJson(req)) as Record<string, unknown>;
      if (pathname === "/care/pain") {
        const lv = Number(body.level);
        const level = Number.isInteger(lv) && lv >= 1 && lv <= 10 ? lv : null;
        send(res, 200, { queued: care.enqueuePain(level) });
      } else if (pathname === "/care/say") {
        const text = String(body.text ?? "").trim();
        if (!text || text.length > 500) {
          send(res, 400, { error: "text must be 1-500 characters" });
        } else {
          send(res, 200, { delivered: m.deliver(String(body.from ?? "Qu"), text) });
        }
      } else if (pathname === "/care/log") {
        care.logSaid(String(body.text ?? ""));
        send(res, 200, { ok: true });
      } else if (pathname === "/care/taken") {
        const profile = await loadProfile();
        const name = String(body.name ?? "").toLowerCase();
        const med = profile.meds.find((x) => x.key === name || x.short.toLowerCase() === name);
        if (!med) send(res, 404, { error: "not on the medicine list" });
        else {
          care.recordDose(med.key);
          send(res, 200, { recorded: med.short });
        }
      } else return false;
    } else return false;
  } catch (err) {
    send(res, 400, { error: (err as Error).message });
  }
  return true;
}
