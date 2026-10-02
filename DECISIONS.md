# Architecture Decisions

### 2026-10-02 — Browser-only architecture, no backend

**Decision**

Run everything in the browser. No Express/FastAPI server. Webcam, MediaPipe, TTS, and UI all client-side.

**Reason**

Minimizes moving parts for a 24-hour hackathon prototype. MediaPipe runs in-browser natively. LLM calls go direct from browser to API. No CORS, no deployment, no server process to manage.

**Alternatives considered**

- FastAPI backend with YOLO — too heavy, requires Python + model serving
- Node backend proxying API calls — adds complexity for minimal benefit

**Implication**

LLM API key will be exposed in client code. Acceptable for a hackathon prototype, not for production.

---

### 2026-10-02 — Keyboard-first, ring-never for prototype

**Decision**

Simulate ring with keyboard: Space (click/capture), D (double-click/backchannel), H (hold/queue). No ring hardware in this prototype.

**Reason**

The prototype validates the interaction model and UX flow. The ring is a hardware swap — same events, different input source. Building keyboard-first means 100% of the prototype code transfers to the hackathon build.

**Alternatives considered**

- Wait for ring hardware to test — blocks all progress
- Simulate ring with mouse gestures — keyboard is simpler and closer to the ring's single-button model

**Implication**

All input handling must go through an event abstraction (InputEvent type with click/double/hold variants) so the ring can plug in later.

---

### 2026-10-02 — Mock LLM for v1, real API as stretch

**Decision**

Start with template-based sentence generation ("I [verb] [noun]"). Wire real Claude Haiku API as a stretch goal.

**Reason**

Unblocks the full UI flow without API key setup or rate limits. The LLM is a drop-in upgrade — same input (tiles + core words), same output (string array).

**Alternatives considered**

- Start with real API — adds setup friction, costs money during iteration
- Use a local LLM — too heavy for browser, defeats the point

**Implication**

compose.ts must have a clean interface that works with both mock and real implementations.

---

### 2026-10-02 — Browser SpeechSynthesis for TTS

**Decision**

Use the browser's built-in SpeechSynthesis API, not ElevenLabs.

**Reason**

Zero dependencies, zero cost, works offline. Voice quality is secondary for a prototype — the interaction timing matters more.

**Alternatives considered**

- ElevenLabs Flash v2.5 — better voice quality but adds API dependency, latency, and cost
- Piper TTS (WASM) — possible but adds bundle complexity

**Implication**

speak.ts should abstract TTS behind an interface so ElevenLabs can replace SpeechSynthesis at the hackathon.
