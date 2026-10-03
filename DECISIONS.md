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

---

### 2026-10-02 — Two-stage vision: track with the detector, identify with a classifier

**Decision**

Run the COCO object detector continuously for live tracking boxes; on click/Space, crop the box and run an ImageNet classifier (plus optional Claude vision) to name it.

**Reason**

COCO's 80 classes are good for finding objects in real time but too coarse to name them ("bottle" vs "water bottle"). The classifier is far more specific and only needs to run once per capture. Claude vision, when a key is present, handles anything neither model knows.

**Alternatives considered**

- Detector labels only — too coarse
- Claude vision only — needs network and a key, ~1s latency, no live boxes

**Implication**

The detector picks *where*, the classifier/Claude decide *what*. Users can rename a tile from the alternatives list when the models disagree.

---

### 2026-10-03 — Camera and ring button behind interfaces (`src/vision/`)

**Decision**

All camera input goes through `FrameSource` (webcam, WebSocket, Bluetooth still, files) and all button input through `ButtonInput` (keyboard, WebSocket, Bluetooth). Source, burst size and orientation are chosen in one place (`src/vision/settings.ts`, settings panel or `?source=`). Frames are rotated/flipped to upright before detection, so recognition never knows which hardware produced them.

**Reason**

The ring's camera and radio are still undecided (Wi-Fi board vs. Bluetooth, stream vs. one picture per press). Swapping hardware should be one new file, not a rewrite. Orientation must be fixed before detection because the ring can be worn on either hand at any rotation.

**Alternatives considered**

- Keep `getUserMedia` inside `CameraView` and special-case the ring later — every new board would touch the UI and detection loop
- Rotate only the display — detector and classifier would still see sideways images

**Implication**

`CaptureTarget` now carries an upright `image` canvas (`video` is optional), and still-mode sources work with no live preview. Bluetooth UUIDs and the WebSocket message format are placeholders documented in `src/vision/README.md`.

---

### 2026-10-03 — Still-mode bursts, sharpest frame wins

**Decision**

A still-mode press may return several JPEGs (`captureBurst`, default 3). The sharpest (variance of the Laplacian on a small grayscale copy) is named; the next two are kept for merging names. Transfers end on count, an end-of-burst marker, an adaptive idle gap, or a total timeout, and partial bursts are used.

**Reason**

Pressing the ring's button shakes the hand and blurs the picture. A few frames around the press almost always include a sharp one. Single-image firmware still works through the `capture()` fallback.

**Alternatives considered**

- One picture per press — simplest, but the blurriest moment is exactly when the button goes down
- Always waiting for the full burst — over Bluetooth that can take several seconds

**Implication**

Burst size trades blur robustness for latency over Bluetooth; the eval harness should measure both before the default is fixed.
