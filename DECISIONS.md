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

Burst size trades blur robustness for latency over Bluetooth; the eval harness should measure both before the default is fixed. The ring's camera is off until the press, so still mode is the primary path: the first frame of each burst is discarded by default (wake-up frames are often dark), an optional delay lets the hand settle, and nothing assumes frames from before the press.

In stream mode (webcam, the development and demo path) the same sharpness score picks the best of the last ~10 frames from before the press (skipping the final 50 ms), minus a penalty for target motion. Scoring happens only at press time; measured frame rate and press-to-tile latency are unchanged from `main` (57 fps, ~60–115 ms in headless Chrome).

---

### 2026-10-03 — Aim point, calibration per source and hand, ranked candidates

**Decision**

Candidates are ranked around a calibrated aim point instead of the frame centre: smallest box containing the aim point first, then by distance, at most N (default 4), plus a crop around the aim point when no box covers it. Calibration (3–5 presses at an on-screen colour target, or tapping the object) is stored per source and per hand. The live "on target" cue is optional and stream-only; every capture sends "got it" feedback.

**Reason**

The camera is offset from the fingertip and the offset differs per hand and per mounting. In still mode there is no live preview to correct aim, so calibration has to carry it. The smallest-box rule picks the held apple over the person holding it. Offering a short ranked list fits "a few good choices beats one confident wrong answer".

**Alternatives considered**

- Largest/most central box (the previous `pickCentral`) — picks the person instead of what they hold
- Only on-target feedback, no calibration — impossible in still mode, where the camera is off until the press

**Implication**

`pickCentral` in `CameraView` was replaced by the ranking. Scanning (Phase 3) walks `CaptureTarget.candidates`.

---

### 2026-10-03 — Name the centre first; widen or offer choices only when unsure

**Decision**

Assume for now that the user points straight at the object: aim point = frame centre (calibration optional, off by default). Each press names a tight centre crop first; only if confidence is low (or the user double-presses within 4 s to retake) does it widen to the covering detected box and a larger centre crop, and then to the other detected objects. A different object is never picked automatically: low-confidence results and other-object answers go to a single-switch scanner (click next, hold choose, double retake). Tiny objects under the centre get a "Move closer" hint; far-object handling is deferred.

**Reason**

Predictable, fast behaviour for the common case (one crop, ~50 ms on a laptop), with choices instead of a confident wrong word when unsure. Ring mappings only change while a result or choices are on screen, and all of them live in one table (`src/vision/input/mappings.ts`).

**Alternatives considered**

- Always show ranked candidates — slower and more work for the user when the centre is already clear
- Auto-picking the most confident object anywhere in the frame — names things the user didn't point at

**Implication**

`lowConfidence` and the "tiny" area are placeholders until the eval harness measures them. Mouse clicks still name the clicked box directly.

---

### 2026-10-03 — SigLIP 2 zero-shot naming over a curated everyday vocabulary

**Decision**

Name crops with SigLIP 2 base (224 px, ONNX via Transformers.js) against a hand-curated 637-label daily-living/AAC vocabulary (`src/data/vocabulary.ts`, built from the LVIS, Open Images and Objects365 class lists filtered to household items, plus AAC items they lack). Label text embeddings are precomputed at build time and committed (~1 MB); only the 55 MB `q4f16` vision model runs in the browser, in a Web Worker, WebGPU first with WASM fallback. The EfficientNet/ImageNet classifier stays as the last fallback, with place labels removed and breed-level labels mapped to everyday words.

**Reason**

ImageNet labels fit AAC badly ("restaurant", "tabby", "quilt"). A vocabulary we write only contains words a user would want spoken. Precomputing text embeddings avoids a 283 MB text-model download in the browser. On the 22 in-vocabulary placeholder photos (aim-point crop), fp16 got 16/22 top-1 and 21/22 top-3; `q4f16` 15/22 and 21/22 at a third of the size. The `q8`/int8 vision export is badly degraded (it ranks "purse" above "cat"), so it is not used.

**Alternatives considered**

- `Xenova/siglip-base-patch16-224` (SigLIP 1) — SigLIP 2 has a working ONNX export for Transformers.js and is the stronger model
- Computing text embeddings in the browser and caching in IndexedDB — 283 MB first-run download; agreed to precompute instead
- fp16 vision model — marginally better but 186 MB

**Implication**

`vite.config.ts` sends COOP/COEP (`credentialless`) headers so WASM inference can use threads (~3× faster on CPU). WebGPU and WASM give noticeably different scores on some images (e.g. "mug" vs "travel mug"), so the eval should report both. The confidence threshold must be re-tuned for SigLIP scores in Phase 7.

---

### 2026-10-03 — Personal objects are matched before the vocabulary

**Decision**

A caregiver teaches an object with 3–5 photos and a name. Each photo stores SigLIP 2 image embeddings of the centre crop and of the smallest detected box under the aim point, in IndexedDB. At capture each crop is compared with every taught object (cosine to its nearest stored view); a match needs cosine ≥ 0.92 and a lead of ≥ 0.04 over the next taught object. A match becomes the tile's name with confidence 0.6–1 (no scanner), the vocabulary's top 3 become the "fix the name" chips, and Claude refinement is skipped so it can't overwrite the taught name.

**Reason**

The names that matter most to a user ("Mom's mug", "my walker") aren't in any vocabulary. Reusing the SigLIP image embedding costs nothing extra at capture (one dot product per stored view). A margin over the runner-up keeps two similar taught objects from being confused.

**Alternatives considered**

- Fine-tuning or a separate few-shot model — heavy, not feasible in the browser
- Adding taught names as extra text labels — text can't capture "this particular mug"

**Implication**

Thresholds come from the eval (see the eval entry). Embeddings are tied to the model (`model` field); objects taught with another model are kept but not matched until re-taught.

---

### 2026-10-03 — Unsure answers ask Claude; confirmed selections are logged and slightly boost ranking

**Decision**

When the pointed-at crops are below the confidence threshold the result stays an unsure set of choices; with a Claude key the lead crop also goes to the existing Haiku vision path (6 s timeout) and its name is added as one more choice (or offered alone for confirmation when nothing on-device was worth showing). Every tile is logged locally (label, source personal/vocab/fallback/manual, time, time of day; no images) and corrections update the same entry. Recent and frequent picks (14-day half-life, ×1.5 at the same time of day) add at most 0.006 cosine to a label's rank; the boost changes the order of the top 3 only, never the confidence.

**Reason**

Claude is good at free-form names for objects outside the vocabulary, but a confident-sounding wrong name is the worst outcome, so it is only ever offered as a choice. Users name the same few things repeatedly; a small, capped nudge helps near-ties without letting habit turn a wrong guess into a confident one.

**Alternatives considered**

- Replacing the on-device answer with Claude's — loses the "choices, not one confident answer" rule
- Boosting the confidence as well as the order — could push a wrong label over the auto-commit threshold

**Implication**

`history.ts` exposes `historyLog()` / `historySummary()` for a future caregiver service. Choices confirmed in the scanner are no longer re-named by Claude afterwards.

---

### 2026-10-03 — Thresholds picked by the eval harness

**Decision**

`npm run eval` runs the labelled images through the ring's still-mode code path on WebGPU and WASM and sweeps the thresholds. Chosen on `test-images/` (25 CC0 photos):

- `lowConfidence` = **0.35** (unchanged from the placeholder, now measured). Mean over both backends at 0.35: 72 % of presses become a tile directly with 6 % wrong auto-commits (WebGPU 4 %, WASM 8 %), against 8 % at 0.30 and 12 % at 0.25. Above 0.35 wrong auto-commits don't fall any further (the remaining errors score 43–90 %), only the auto-commit rate does.
- Personal objects: threshold **0.92**, margin **0.04** (was 0.85 / 0.02). The closest pair of *different* objects scored 0.904 on WebGPU (two sets of car keys; a spoon and a remote on similar plain backgrounds) and 0.864 on WASM. With the old 0.85 / 0.02, 20 % of untaught objects would have been named as a taught one on WebGPU (4 % on WASM). 0.90 / 0.04 is the lowest setting with zero false matches on both backends, but only the margin keeps it clear of the 0.904 pair; 0.92 sits above every different-object score at any margin, and the augmented positives (all ≥ 0.94) can't tell the two apart.
- `minShow` stays 12 %: correct names scored from 13 %; out-of-vocabulary objects scored 8–39 %, but all of them were unsure and went to the scanner or "not sure", never straight to a tile.

**Results** (centre aim, as the ring does today; full tables in `eval-results/summary.md`)

| Backend | top-1 | top-3 | auto | wrong auto | not sure | naming avg / p95 | capture-to-name |
|---|---|---|---|---|---|---|---|
| WebGPU | 76 % | 84 % | 64 % | 4 % | 12 % | 89 / 166 ms | 128 ms |
| WASM | 80 % | 88 % | 80 % | 8 % | 4 % | 497 / 1046 ms | 543 ms |

All answers came from the vocabulary (personal objects and history are excluded from this run). Personal objects through the same pipeline at 0.92 / 0.04: 100 % of taught objects recognised, 0 % false matches, 42 ms (WebGPU) / 268 ms (WASM).

**Reason**

The costly error for this user group is a wrong word committed without asking, so thresholds minimise wrong auto-commits first and only then maximise automation. A user runs one backend, so the confidence threshold uses the mean over backends; personal false matches must be zero on every backend.

**Limitations**

- 25 placeholder photos is far too few; one image moves a rate by 4 %. Re-run once `test-images-public/` (VizWiz/ORBIT slice) and real ring photos exist.
- The remaining wrong auto-commits are vocabulary problems, not thresholds: "prayer book" and "travel mug" are too specific, and the keyboard of a laptop is named "keyboard". Merging over-specific labels into their everyday parent would help more than any threshold.
- The personal "own object" scores come from augmented copies of one photo (0.94–0.99), which is optimistic; a real webcam re-capture of a taught object scored 0.92–0.97, so some real objects will narrowly miss at 0.92 and fall back to the vocabulary (safe, but less helpful). Teach 5 photos from varied angles.
- WebGPU and WASM produce noticeably different scores with the 4-bit model (e.g. "mug" vs "travel mug"), so thresholds should be re-checked if the model or its quantisation changes.
