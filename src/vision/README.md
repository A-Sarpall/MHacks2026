# src/vision

Camera, ring and recognition code for Qu. It is split so hardware can change without touching recognition:

```
sources/        camera input (FrameSource): webcam, Wi-Fi/WebSocket, Bluetooth still, files
input/          ring button input (ButtonInput): keyboard, WebSocket, Bluetooth + feedback output
core/           recognition helpers that only see images (no hardware imports)
settings.ts     which source/button is used, burst size, per-source+hand orientation
useVisionIO.ts  React hooks that start/stop the chosen source and button inputs
```

## Camera sources

Every camera implements `FrameSource` (`sources/types.ts`):

| Member | Meaning |
|---|---|
| `mode` | `"stream"` (continuous frames, live preview + tracking) or `"still"` (pictures on button press) |
| `start()` / `stop()` | Open / close the connection. Safe to call repeatedly. |
| `onFrame(cb)` | Stream mode. `cb(frame, time)` receives an `ImageBitmap` it now owns (and must close). |
| `capture()` | One picture. Must reject or time out instead of hanging. |
| `captureBurst(n)` | Optional. Several pictures from one press; may return fewer than `n`. |
| `status()` / `onStatus(cb)` | `idle / connecting / live / reconnecting / error` plus a message for the user. |
| `pair()` | Optional; for sources that need a click to connect (Bluetooth). |

Callers use `captureFrames(source, { count, discard, delayMs })`. It waits `delayMs` after the press (lets the hand settle), asks for `count + discard` pictures, and drops the first `discard` (small camera modules often return dark or off-color frames right after waking). It uses `captureBurst` when the source has it and falls back to a single `capture()` otherwise; it never discards the last remaining frame, so single-image hardware keeps working.

The real ring keeps its camera off until the button is pressed, so **still mode is the primary path**; the webcam stream is for development and demos. Nothing in still mode assumes frames exist from before the press.

| Source | File | Notes |
|---|---|---|
| Webcam / USB camera | `WebcamSource.ts` | getUserMedia; reconnects when the camera is unplugged |
| Wi-Fi camera | `WebSocketSource.ts` | One JPEG per binary message. Stream: board pushes frames. Still: see protocol below. |
| Bluetooth ring | `BleStillSource.ts` | Still only; see protocol below |
| Image files | `FileSource.ts` | Still; pick images, or pass Blobs/URLs (a nested array is one burst). Used by tests and eval. |

### Bursts

In still mode one press can return several JPEGs (taken in quick succession, or the best few from an on-device buffer just before the press). Every frame is oriented, scored with `core/sharpness.ts` (variance of the Laplacian on a 160 px grayscale copy of the central 60 %), the sharpest is shown and named, and the next two are kept on the capture (`CaptureTarget.alternates`) for name merging. Transfer stops at whichever comes first:

- the requested count arrives;
- the board signals the end of the burst;
- no new image for `max(gap, 1.5 × slowest gap so far)` (600 ms Wi-Fi, 1.5 s Bluetooth), which covers firmware that ignores the count;
- the total timeout (5 s Wi-Fi, 8 s Bluetooth). A partial burst is used; zero images is reported to the user as an error.

"Photos per press" (1–5, default 3, `?burst=N`) trades blur robustness against capture-to-name latency, which the eval harness measures. "Skip first photos" (0–3, default 1, `?discard=N`) and "Wait after press" (0–3000 ms, default 0, `?delay=MS`) are next to it in the panel.

`FileSource` can simulate a ring burst from one still image: `?source=file&simwake=1&simwakems=300&simframems=150&simshake=2` adds 1 dark/off-color wake frame, 300 ms camera wake-up, 150 ms per photo transfer, and press shake (blur strongest right after the press, then settling: `SHAKE_PATTERN`). The same fields are in the panel when "Image files" is selected.

### Stream mode: frame buffer (webcam / dev path)

Stream sources keep the last 10 upright frames in `core/frameBuffer.ts` with their timestamp and the target's speed (from the tracker: how fast the focused box moved, in frame diagonals per second). On a button press, frames from the last 50 ms are skipped (the press itself shakes the camera), the rest are scored with the same sharpness measure as still bursts, minus a motion penalty (`score = sharpness / max − 0.5 × min(1, speed / 0.5)`), and the best one is used. Sharpness is computed only at press time, so the detection loop pays nothing for it. The view freezes on the chosen frame (1.5 s for now; Phase 3's scanner will control it), detection is re-run on that frame so the boxes match it, and evicted bitmaps are closed. Mouse clicks still use the frame on screen.

## Naming: centre first, widen only when unsure (`core/escalate.ts`, `naming.ts`)

For now Qu assumes the user points straight at the object: the aim point is the frame centre (calibration exists but is off by default, "use it" in the panel / `?calib=1`). Each ring press names crops in this order and stops as soon as one is confident (`DEFAULT_NAMING.lowConfidence` = 0.45, chosen by the eval; see below):

| Level | Crops | When |
|---|---|---|
| 0 | tight centre crop (35 % of the short side) | always |
| 1 | the smallest detected box covering the centre + a wider centre crop (65 %) | centre crop unsure, or the user retakes |
| 2 | every other detected object | still unsure, or a second retake |

Whole-frame detection keeps running (stream) or runs on the still, and supplies the level 1–2 boxes. If the best answer is confident and came from the centre/wide/covering box, it becomes a tile directly (other answers become the "fix the name" chips). Otherwise the choices go to the **scanner** instead of guessing (even a single unsure choice is confirmed there: hold = yes, double = retake). Guesses below a minimum score (`minShow`, 12 %: on the eval set correct names scored from 13 %) aren't offered unless the detector is fairly sure the object is there (`minDetector`, 50 %); if nothing clears the bar, the user gets "Not sure what that is. Try again or move closer" and an error buzz instead of a near-random word. Confidence is judged only on the pointed-at crops, and the choices are ordered by how likely they are to be what the user pointed at, not by how confident the name is: centre / covering-box / wide crops first (most confident of those leading), then other objects nearest the centre first. Choices with the same name are merged, and at most N are shown ("choices", default 4). If the object under the centre is tiny (< 1 % of the frame), a "Move closer" hint is shown; there's no special handling for far objects yet.

Two more rules lean the result toward "unsure" rather than a confident wrong word:

- **Blur gate** (`minSharpness`, 200): if the chosen frame's sharpness score (the same variance-of-Laplacian used to pick frames) is below the gate, the result is treated as unsure however confident the model sounds, because motion blur makes SigLIP confidently wrong rather than unsure. On the eval set every clean photo scores above 330 and synthetically blurred ones around 86. `App` passes the burst's or stream pick's sharpness in `NamingInput.sharpness`.
- **Broad word** (`broadMin` 0.5, `broadCommit` 0.6, `GENERIC_WORDS` in `vocabulary.ts`): when unsure, the probability of the whole vocabulary is summed per category. If one category holds ≥ 50 % and has an everyday word (person, animal, fruit, vegetable, food, drink, clothes, furniture, electronics, tool), that word is offered first in the scanner ("65 % sure it's some kind of furniture"); at ≥ 60 % it becomes the tile directly, with the specific guesses as the "fix the name" chips. "Fruit" for a banana is a safe answer; "corn" is not. Health & medical, kitchen, bathroom and the other categories have no broad word (a broad "medicine" would also trigger the medication check). A blur-gated result never auto-commits, broad or not.

## Naming model: SigLIP 2 + daily-living vocabulary

Every crop is named by **SigLIP 2** (`onnx-community/siglip2-base-patch16-224-ONNX`, 4-bit `q4f16` vision model, 55 MB) zero-shot against **`src/data/vocabulary.ts`** — 637 everyday and AAC labels in 18 categories (people & body, food, kitchen, bathroom, health & medical incl. pill organizer / walker / hearing aid / glasses case, clothes, personal items, furniture, electronics, cleaning, tools, office, leisure, outdoors). Labels are the words a user would say; an optional prompt clarifies them ("remote" → "a TV remote control"). The same label may appear twice with different prompts ("fish" the animal and the food); the best one wins. Places and scenes ("restaurant") are deliberately not in it.

- **Text side, precomputed:** `npm run embed-vocab` encodes every label with 4 prompt templates (averaged) using the text model (283 MB, only on the developer's machine, ~30 s) and writes `public/vocab/siglip2-base-224.{bin,json}` (float16, ~1 MB, committed). Re-run it after editing the vocabulary; the app warns in the console if they're out of sync.
- **Image side, in the browser:** `siglip.worker.ts` runs in a Web Worker, WebGPU first, WASM fallback (`?siglip=wasm` to force, `?siglip=off` to disable). Model, config and ONNX runtime are served from `public/` (`npm run dev` downloads/copies them), so after the first run nothing is fetched from the internet. Load progress shows under the camera.
- **Scores:** `confidence` is a softmax over the vocabulary with SigLIP 2's learned scale (e^4.72 ≈ 113). Narrow labels are grouped under the everyday word the user would say (`PARENT_LABELS` in `vocabulary.ts`: "prayer book", "Bible" → book; "travel mug" → mug; "sneakers" → shoes; "reading glasses" → glasses; 44 in all): the group's probabilities are added and the everyday word is shown, with the narrow label kept as the first "fix the name" chip. Medication labels are never grouped, so the medicine check still triggers on them. Top 3 groups become the name + chips. When unsure, the scanner also offers the next SigLIP guesses for the pointed-at crop, so even an object outside the vocabulary gets real choices.
- **Fallback:** if SigLIP isn't loaded or fails, the old EfficientNet/ImageNet classifier is used, cleaned by `core/imagenetMap.ts`: place/scene labels are dropped and over-specific ones mapped to everyday words (tabby → cat, quilt → blanket, notebook → laptop, dog breeds → dog). Claude refinement still runs on top when a key is set.
- **Speed (headless Chrome, M-series Mac):** ~0.1 s per press on WebGPU (0.2 s when it widens), 0.3–0.9 s on WASM with cross-origin isolation (`vite.config.ts` sets COOP/COEP so WASM can use threads; ~3× faster than without).

## Personal objects (`personal.ts`, `core/personalMatch.ts`)

A caregiver can teach Cue a specific object ("Mom's mug"): "Teach objects…" in the Camera & ring panel. Take 3–5 photos (ring click / Space = photo, double / D = undo, hold / H = save), type a name, save. Each photo stores two SigLIP 2 image embeddings: the centre crop and the smallest detected box under the aim point. Objects live in IndexedDB (`cue-personal` → `objects`: id, name, embeddings, thumbnail, createdAt, model) with an in-memory cache and change events; the same screen lists, renames and deletes them. Objects taught with a different model are kept but not matched.

At capture, every crop's embedding is compared with the taught objects first (cosine, nearest photo per object). A match needs cosine ≥ 0.92 and a lead of ≥ 0.04 over the next taught object (picked by the eval: above every score between two different objects on WebGPU and WASM; see `DECISIONS.md`); its confidence is mapped to 0.6–1, so it is committed without the scanner, labelled with the taught name (source `personal`, tile says "taught"), and the vocabulary's top 3 become the "fix the name" chips. Claude refinement is skipped for taught names so it can't overwrite them. The console logs `[personal]` with the nearest cosine for each crop.

## Unsure answers: Claude fallback (`naming.ts` → `askClaude`)

When the pointed-at crops are below `lowConfidence`, the result is marked low and the scanner opens with the on-device choices as before. If a Claude key is set, the lead crop is also sent to the existing Haiku vision path (`identifyWithClaude`, 6 s timeout) with the on-device guesses as hints; its free-form name is inserted right after the highlighted choice (so the highlight doesn't jump) and shown as "Claude's guess". If nothing on-device was worth showing, Cue asks Claude first and offers its answer for confirmation (hold = yes, double = retake) before falling back to "Not sure what that is". Choices confirmed in the scanner are not re-named by Claude afterwards; confident on-device names still get the existing Claude refinement.

## Selection history (`history.ts`, `core/history.ts`)

Every tile the user ends up with is logged in localStorage (`cue.vision.history.v1`, last 2000): label, source (`personal` / `vocab` / `fallback` = Claude or the old classifier / `manual`), timestamp, and time of day (morning 5–12, afternoon 12–17, evening 17–22, night). No images. A later Claude refinement or a "fix the name" correction updates the same entry instead of adding a new one.

The log nudges the vocabulary ranking: each pick weighs `0.5^(age / 14 days)`, ×1.5 if it was made at the same time of day; a label's boost is `0.006 × (1 − e^(−weight / 3))` in cosine units (one recent pick ≈ 0.002, so it only reorders near-ties). The boost changes the order only; the confidence shown and used for "unsure" stays the model's own. Personal objects aren't boosted.

For other services (e.g. a future caregiver agent): `historyLog()`, `historySummary({ since })` (per label: count, last time, counts by source and time of day), `onHistoryChange(cb)`, `clearHistory()`.

## Ring button mappings (`input/mappings.ts`)

One table, so it's easy to change:

| Mode | click | double | hold |
|---|---|---|---|
| normal | take picture | quick reply (backchannel) | queue sentence |
| review (4 s after a result) | take picture | **retake one level wider** | queue sentence |
| scanning | next choice | retake one level wider | choose |
| autoscan (choices advance every X s) | choose | retake | cancel |

Scanner options: "Say each choice aloud" (uses `speak.ts`) and "Auto-scan every X s" (`?speakhl=1`, `?autoscan=1&scansec=2`). The highlighted choice is shown large under the camera; everything else on the frozen frame is dimmed. Mouse clicks on a box skip all of this and name that box directly.

## Aim zone, calibration and candidates (`core/aim.ts`)

The ring's camera sits off the fingertip, so "where the user points" is rarely the exact frame centre. Everything is relative to an **aim point** = frame centre + a calibration offset, and an **aim zone** around it (default half the width × half the height = 25 % of the frame, "zone" in the panel, `?zone=0.5`).

- **Calibration** ("Calibrate aim…" in the panel; only applied when "use it" is ticked): point the ring at the pink on-screen target (or any object) and press 3–5 times. The target is found automatically by colour (`core/marker.ts`); if it isn't visible, the user taps where the object is in the picture. The average offset and its spread are stored in localStorage **per source and per hand** (`cue.vision.calibration.v1`, keys like `ble:left`). During calibration the ring button means click = take picture, double = undo, hold = save. In still mode this is what does the aiming work.
- **Ranking** on the chosen frame: the smallest box containing the aim point first (an apple held in front of a person beats the person), then other boxes containing it by size, then the rest by distance from the aim point; at most N (default 4, "choices", `?n=4`). If no box contains the aim point, a crop around it ("here") is added — first if every box is more than 8 % of the diagonal away (the user is probably pointing at something the detector doesn't know), last otherwise. No boxes at all → just that crop. The list is on `CaptureTarget.candidates` for the scanner.
- **On-target cue** (stream mode only, optional, "“On target” cue", `?ontarget=0` to disable): when the top candidate covers the aim point, has been tracked for 3+ detections and the target is moving slower than 0.25 diagonals/s for 300 ms, the zone turns green and `on-target` feedback fires once per object.
- **"Got it"**: every successful capture sends `captured` feedback (ring buzz/beep on sources that support it, browser beep/vibrate if "Beep/vibrate on this device" is on); failures send `error`.

### Choosing a source

One place: `settings.ts`. The "Camera & ring" panel under the camera saves to localStorage; URL parameters override it:

```
?source=webcam|ws|ble|file
&url=ws://192.168.4.1:81/     WebSocket camera URL
&mode=stream|still             WebSocket frame mode
&burst=1..5                    photos per press (still mode)
&discard=0..3                  drop the first N photos of each burst (default 1)
&delay=0..3000                 ms to wait after the press before capturing
&simwake=N&simwakems=MS&simframems=MS&simshake=X   file-source ring simulation
&button=none|ws|ble            ring button connection (keyboard always works)
&buttonUrl=ws://...            if the button uses a different socket than the camera
&hand=right|left
&rotate=0|90|180|270&flip=1    orientation override for this source + hand
&zone=0.1..1&n=1..8            aim zone size (fraction of width/height), max candidates
&ontarget=0|1&beep=0|1         on-target cue (stream only), local beep/vibrate
&calib=0|1                     apply the saved calibration offset (default off: aim at the centre)
&speakhl=1&autoscan=1&scansec=2   scanner options
```

### Orientation

Every frame goes through `orientFrame()` (`sources/orient.ts`) before anything else sees it, so recognition always gets an upright image. Settings are stored per source and per hand (`ws:left`, `ble:right`, …). The hand presets in `HAND_PRESETS` (right = upright, left = 180°) are guesses until the ring is built; adjust them once the camera is mounted. The preview's "Mirror" button is display-only and separate from "Flip image".

## Ring button

Every button implements `ButtonInput` (`input/types.ts`): `start(handler)`, `stop()`, optional `status/onStatus`, `pair()`, and `feedback(kind)` for buzz/beep output (`on-target`, `captured`, `highlight`, `select`, `error`). `InputHub` runs the keyboard plus at most one ring button and sends feedback to all of them.

## Wire protocols (placeholders until the firmware exists)

### Wi-Fi (WebSocket)

| Direction | Message |
|---|---|
| board → browser, binary | one complete JPEG |
| browser → board | `{"type":"capture","count":3}` (still mode) |
| board → browser | `{"type":"burst-end"}` after the last JPEG of a burst (optional but saves the gap wait) |
| board → browser | `click` / `double` / `hold`, or `{"type":"button","action":"click"}` |
| browser → board | `{"type":"feedback","kind":"select"}` |

Camera and button may share one socket (same URL); `wsLink.ts` reference-counts it.

### Bluetooth

`sources/bleLink.ts` → `RING_BLE`. **All UUIDs are placeholders** (`isPlaceholder: true`); replace them with the firmware's values.

| Characteristic | Direction | Content |
|---|---|---|
| `imageControl` | write | `0x01 N` = take N pictures |
| `imageData` | notify | per JPEG: `0xA0` + uint32 LE length + bytes, then `0xA1` + bytes … ; `0xA2` = end of burst |
| `button` | notify | `0x01` click, `0x02` double, `0x03` hold |
| `feedback` | write | 1 on-target, 2 captured, 3 highlight, 4 select, 5 error |

If the firmware pushes pictures on its own when the button is pressed, `captureBurst()` uses those (if under 1.5 s old) instead of requesting more. Pair once with the "Pair ring" button (Chrome requires a click); it reconnects automatically after drop-outs.

## Testing without hardware

```bash
npm test                                                           # unit tests
node scripts/mock-ring.mjs --dir test-images --port 8181           # Wi-Fi ring, streaming
node scripts/mock-ring.mjs --dir test-images --port 8181 --still   # one burst per capture request
```

Then open `http://localhost:5173/?source=ws&url=ws://localhost:8181/&button=ws` (add `&mode=still` for still mode) and type `c`, `d` or `h` + Enter in the mock's terminal to press the ring button. Mock options: `--frame-delay MS` (simulate slow transfer), `--single` (firmware that ignores burst count), `--sequential` (cycle through images), `--drop-after N` (drop the connection to test reconnects).

## Evaluation (`eval/`, `core/evalScore.ts`, `scripts/eval.mjs`)

`npm run eval` starts Vite, opens `/?eval=1` in headless Chrome once on WebGPU and once on WASM (`?siglip=wasm`), and writes `eval-results/webgpu.json`, `wasm.json` and `summary.md`. The page runs each image through the ring's still-mode building blocks: `FileSource` → `captureFrames` → `orientFrame` → sharpness ranking → `detectImageFrame` → `rankCandidates` → `nameTarget` (the same naming code `App` calls). Only `CameraView`'s painting/freezing glue is skipped. Taught objects and the selection history are left out so results don't depend on the browser's stored data.

Input: a folder with `labels.json` mapping each image to `{ "label", "accept": [synonyms], "aim": [x, y] (0–1, optional), "tags": [...] }`. `test-images/` (25 CC0 photos: single, cluttered, held, out-of-vocabulary) is the default; `test-images-public/` (e.g. ~100 VizWiz/ORBIT images) is picked up automatically when it exists, and `--dirs a,b` chooses others. Each folder is reported separately, with the centre as aim point (what the ring does today) and with the labelled aim point (a calibrated user), per tag.

Reported: top-1 and top-3 (labels or accepted synonyms, plural-insensitive), auto-commit rate (sure → tile without asking), **wrong auto-commits** (the costly error: a wrong word spoken without confirmation), "not sure" rate, naming latency (avg/p95) and capture-to-name latency, and which source answered. Then:

- **Confidence sweep**: `lowConfidence` from 0.15 to 0.6. The picker takes the lowest wrong-auto rate any threshold reaches, then the most automation, then the higher threshold; across backends it uses the mean.
- **Personal objects**: every image is taught from 3 augmented views (zoom, shift, rotation, lighting) and queried with a 4th. For each threshold/margin it measures true matches, false matches (the object wasn't taught but matched something else) and confusions; the picker requires zero false matches and confusions on every backend. The chosen setting is then re-checked through `nameTarget`.

- **Blur gate and broad word**: each case records whether it was blur-gated and whether the answer was a broad category word; a broad word is counted as *broad* (safe, not top-1, not wrong) when it is the category word of the expected label, and as wrong otherwise. The confidence picker maximises *exact* automation (auto-commits minus broad ones), then prefers the higher threshold within 5 points.
- **Degraded conditions** (`--conditions`, `core/degrade.ts`): every image is also named after being darkened (×0.4 and ×0.18 plus sensor noise), over-exposed, made noisy, motion-blurred (4 % of the short side), zoomed in 1.8× on the aim point, tilted 18°, dark + blurred, turned sideways (90°), upside-down and mirrored, each with three treatments: `plain`, `upright-agree` (whole-frame re-orientation when detector and SigLIP agree, see below) and `rot-margin` (four-rotation crop search). The "re-oriented" column is the share of frames a treatment turned; on clean frames it must be 0 %. The table shows top-1 / wrong auto-commits / broad / auto-commits / blur-gated / re-oriented / median sharpness / naming ms / total ms per condition so a change can be judged on the conditions it targets without hurting clean photos.

Options: `--backends webgpu,wasm`, `--dirs`, `--no-sweep`, `--no-personal`, `--conditions`, `--claude` (also ask Claude for unsure answers; needs a key), `--headed`, `--report-only` (rebuild `summary.md` from the JSON).

### Orientation: what the model tolerates, and what it doesn't

Frames are corrected by the per-source, per-hand rotation/flip setting (`orientFrame`, unit-tested for all eight combinations), which handles how the camera is mounted. It does not know how the finger is rolled at the moment of the press. Measured on WebGPU with the setting bypassed (top-1 / wrong tiles without asking): upright 76 % / 4 %, tilted 18° 72 % / 4 %, mirrored 72 % / 4 %, **sideways 52 % / 8 %, upside-down 48 % / 16 %**. Small tilts and mirroring don't matter; a quarter or half turn does, and upside-down the model is confidently wrong, so the unsure threshold can't catch it.

`NamerOptions.rotations` / `?rotations=` tries the crop at all four quarter-turns: `best` keeps the most confident turn, `avg` averages the embeddings, `unsure` only searches when the upright result is unsure, `margin` switches away from upright only if another turn is ≥ 15 points more confident. All are **off by default**: `margin` fixes upside-down (48 → 64 %, wrong 16 → 8 %) and sideways (52 → 60 %) with clean photos unchanged, but adds wrong tiles on zoomed-in and over-bright frames (8 → 12 %) and triples naming time (93 → 281 ms on WebGPU, ~2 s on WASM); `best` and `avg` hurt clean photos outright (72 % and 48 %).

A tilt sensor on the ring is not an option, so two whole-frame software cues were tried as well (`core/upright.ts`, eval treatments `upright-det` / `upright-agree`): run the object detector on the frame at all four quarter-turns and keep the turn with the most confident detections (margin 0.3 over as-is), optionally requiring SigLIP's whole-frame top score to pick the same turn. Detector alone re-oriented 12 % of clean frames wrongly (28 % of noisy ones) and caught 40–48 % of rotated ones. With agreement, false flips drop to 0 % on clean frames but only 32 % of rotated frames are caught, the confidently-wrong upside-down rate doesn't change, and every press pays ~130 ms. Neither ships. A plain object on a table looks the same at any angle to both models; a reliable orientation estimate would need a small classifier trained on a few thousand real indoor photos. Small roll is cheap (18° costs 4 points), and a hand pointing at a table is usually roughly palm-down, so the mounting setting plus natural pose should cover most presses; confirm with real ring footage.

### Crop treatments (`core/enhance.ts`, off by default)

`?enhance=1` pads non-square crops to a square (SigLIP's preprocessor squashes crops to 224×224, so a long thin box is otherwise distorted) and applies auto-levels to dark or flat crops (stretch the 1st–99th luma percentiles, gamma up to 0.55 when the mean is under 90). `?tta=1` also embeds the mirrored crop and averages the two embeddings. Both are measured by the degraded-conditions eval and are **off** because on the current photos they help only a little in the dark on WebGPU, hurt WASM (clean top-1 88 % → 80 %, dark wrong auto-commits 4 % → 16 %), and flip-averaging doubles the naming time. They stay available for re-testing on real ring photos (`NamerOptions.enhance` / `tta`).

## Connecting new hardware

Recognition never imports hardware code: it takes an upright image plus an aim point. A new ring only needs a source (camera), maybe a button, orientation and calibration.

1. **Camera.** Add `sources/MyRingSource.ts` implementing `FrameSource` (`sources/types.ts`). For a networked board copy `WebSocketSource.ts`; for Bluetooth copy `BleStillSource.ts` and put the real UUIDs in `RING_BLE` (`bleLink.ts`). Set `mode` to `"still"` if the camera only takes pictures on a press (implement `capture()` and ideally `captureBurst(n)`), or `"stream"` if it pushes frames (`onFrame`). Report connection state with `StatusEmitter` (`connecting / live / reconnecting / error`), reconnect on drop-outs without a reload, and use `collectBurst` / `withTimeout` so a capture rejects instead of hanging.
2. **Button.** If the button comes over a different link, add a class to `input/inputs.ts` implementing `ButtonInput` that turns the hardware's events into `click` / `double` / `hold`. If the ring can buzz or beep, implement `feedback(kind)` (`on-target`, `captured`, `highlight`, `select`, `error`) on the source or the button. Keyboard (Space / D / H) always keeps working.
3. **Register it** in three places: `SourceKind` in `sources/types.ts`, `SOURCE_KINDS` in `settings.ts`, and `createSource()` in `sources/index.ts` (buttons: the switch in `useVisionIO.ts`).
4. **Select it** in the "Camera & ring" panel or with `?source=<kind>` (plus e.g. `&url=`, `&mode=still`, `&button=`).
5. **Orientation.** Mount the ring, open the preview, and set "Rotate" / "Flip image" in the panel until the picture is upright (or `?rotate=90&flip=1`). This is saved per source and per hand; update `HAND_PRESETS` in `sources/orient.ts` once you know how the ring sits on each hand.
6. **Calibration.** "Calibrate aim…" → point at the pink target 3–5 times (or tap the object) for each hand, then tick "use it". Saved per source + hand.
7. **Check it.** Run the mock (`scripts/mock-ring.mjs`) to compare against the reference protocol, then point at a few objects; `[capture]` and `[naming]` console lines show burst timing, sharpness, and what was named. If the new camera's images look different from a webcam's (fisheye, low light), capture a few dozen labelled photos into a folder with a `labels.json` and run `npm run eval -- --dirs that-folder` to re-check the thresholds.
