// Qu hub: the one local process the care-loop integrations hang off.
//   Phase 0 (this file): receives ring events (real or fake) and relays them to the browser.
//   Later phases add routes here: /voice (ElevenLabs), /messages (Photon), /health-record (FinchNode),
//   and the bridge to the Python agents. API keys live in server/.env.local, never in the browser.
import "./env.ts";
import { networkInterfaces } from "node:os";
import { createServer } from "node:http";
import { CORS, readJson, send } from "./http.ts";
import { CareState } from "./care.ts";
import { careRoutes } from "./routes-care.ts";
import { createMessaging } from "./messages.ts";
import { messageRoutes } from "./routes-messages.ts";
import { currentSubject, loadProfile, setSubject } from "./finch.ts";
import { labelReaderConfigured, readLabel } from "./label.ts";
import { checkBottle, clinicSummary, type LabelRead } from "./meds.ts";
import { configured, currentVoice, speak } from "./voice.ts";
import { attachRing, isRingAction, type RingAction } from "./ring.ts";

const PORT = Number(process.env.HUB_PORT ?? 8787);
const STARTED = Date.now();

const messaging = await createMessaging();
const care = new CareState();
void loadProfile().then((p) => care.seedDemo(p)).catch(() => {});

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://hub");
  if (req.method === "OPTIONS") return send(res, 204, {});
  if (await messageRoutes(req, res, url, messaging, PORT)) return;
  if (await careRoutes(req, res, url, care, messaging)) return;

  if (req.method === "GET" && url.pathname === "/health") {
    return send(res, 200, { ok: true, uptimeMs: Date.now() - STARTED, browsers: ring.browsers(), phones: ring.phones() });
  }

  // Fake or real ring press: POST /ring/event {"action":"click"|"double"|"hold"}
  if (req.method === "POST" && url.pathname === "/ring/event") {
    try {
      const body = (await readJson(req)) as { action?: unknown };
      const action = body.action ?? url.searchParams.get("action");
      if (!isRingAction(action)) return send(res, 400, { error: 'action must be "click", "double" or "hold"' });
      return send(res, 200, { action, delivered: ring.emit(action) });
    } catch (err) {
      return send(res, 400, { error: String((err as Error).message) });
    }
  }

  if (req.method === "GET" && url.pathname === "/voice/status") {
    const v = currentVoice();
    return send(res, 200, { configured: configured(), voice: v.name, cloned: v.cloned });
  }

  // POST /voice/speak {"text":"..."} -> streamed audio/mpeg in the current voice
  if (req.method === "POST" && url.pathname === "/voice/speak") {
    try {
      const { text, reader } = (await readJson(req)) as { text?: unknown; reader?: unknown };
      if (typeof text !== "string" || !text.trim() || text.length > 500) return send(res, 400, { error: "text must be 1-500 characters" });
      if (!configured()) return send(res, 503, { error: "ELEVENLABS_API_KEY is not set" });
      return await speak(text.trim(), res, CORS, reader === true);
    } catch (err) {
      console.warn("[hub] speak failed:", (err as Error).message);
      if (!res.headersSent) return send(res, 502, { error: (err as Error).message });
      return void res.end();
    }
  }

  // ---- Medication mode (FinchNode record + label reading) ----
  if (req.method === "GET" && url.pathname === "/meds/profile") {
    try {
      return send(res, 200, { ...(await loadProfile()), labelReader: labelReaderConfigured() });
    } catch (err) {
      return send(res, 502, { error: (err as Error).message });
    }
  }

  // Which FinchNode patient Qu is for. GET -> {subject}; POST {"subject": "patient-demo-..."} switches
  // it (the browser's health-record picker), so medicine checks, the clinic summary and the agents agree.
  if (url.pathname === "/meds/patient" && (req.method === "GET" || req.method === "POST")) {
    if (req.method === "GET") return send(res, 200, { subject: currentSubject() });
    const before = currentSubject();
    try {
      const { subject } = (await readJson(req)) as { subject?: unknown };
      if (typeof subject !== "string") return send(res, 400, { error: "send subject" });
      setSubject(subject);
      const profile = await loadProfile(); // confirms the patient exists before anything uses it
      care.seedDemo(profile);
      console.log(`[hub] patient -> ${subject} (${profile.name})`);
      return send(res, 200, { subject, name: profile.name });
    } catch (err) {
      setSubject(before);
      return send(res, 400, { error: (err as Error).message });
    }
  }

  // POST /meds/check {"image": "<jpeg base64>"} or {"drug": "Metoprolol", "strength": "50 mg"}
  // -> { read, verdict }. Typed drug/strength is the fallback when the label cannot be photographed.
  if (req.method === "POST" && url.pathname === "/meds/check") {
    try {
      const body = (await readJson(req, 4_000_000)) as { image?: unknown; drug?: unknown; strength?: unknown };
      let read: LabelRead | null = null;
      if (typeof body.image === "string" && body.image) {
        if (!labelReaderConfigured()) return send(res, 503, { error: "ANTHROPIC_API_KEY is not set, so labels cannot be read from photos" });
        read = await readLabel(body.image.replace(/^data:image\/\w+;base64,/, ""));
      } else if (typeof body.drug === "string") {
        read = { drug: body.drug, strength: typeof body.strength === "string" ? body.strength : null };
      } else return send(res, 400, { error: "send image (jpeg base64) or drug" });
      const verdict = checkBottle(read, await loadProfile());
      console.log(`[hub] meds/check read=${JSON.stringify(read)} -> ${verdict.kind}`);
      return send(res, 200, { read, verdict });
    } catch (err) {
      console.warn("[hub] meds/check failed:", (err as Error).message);
      return send(res, 502, { error: (err as Error).message });
    }
  }

  // POST /meds/clinic {"words": ["My left arm hurts"]} -> summary for the clinician
  if (req.method === "POST" && url.pathname === "/meds/clinic") {
    try {
      const { words } = (await readJson(req)) as { words?: unknown };
      const list = Array.isArray(words) ? words.filter((w): w is string => typeof w === "string").slice(-20) : [];
      return send(res, 200, clinicSummary(await loadProfile(), list));
    } catch (err) {
      return send(res, 400, { error: (err as Error).message });
    }
  }

  send(res, 404, { error: "not found" });
});

const ring = attachRing(server);
ring.onFeedback((kind) => console.log(`[hub] feedback -> ring: ${kind}`));

server.listen(PORT, () => {
  console.log(`[hub] http://localhost:${PORT}  browser ws://localhost:${PORT}/ring`);
  for (const addrs of Object.values(networkInterfaces()))
    for (const a of addrs ?? [])
      if (a.family === "IPv4" && !a.internal) console.log(`[hub] phone app URL: ws://${a.address}:${PORT}/phone`);
  console.log("[hub] type c / d / h + Enter to fake a ring press (click / double / hold)");
});

// Keyboard stand-in for the ring while no hardware is attached.
const KEYS: Record<string, RingAction> = { c: "click", d: "double", h: "hold" };
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk: string) => {
  const action = KEYS[chunk.trim()[0] ?? ""];
  if (!action) return;
  console.log(`[hub] fake ${action} -> ${ring.emit(action)} browser(s)`);
});
