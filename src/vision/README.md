# src/vision

Camera, ring and recognition code for Cue. It is split so hardware can change without touching recognition:

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

For now Cue assumes the user points straight at the object: the aim point is the frame centre (calibration exists but is off by default, "use it" in the panel / `?calib=1`). Each ring press names crops in this order and stops as soon as one is confident (`DEFAULT_NAMING.lowConfidence`, placeholder 0.35 until the eval tunes it):

| Level | Crops | When |
|---|---|---|
| 0 | tight centre crop (35 % of the short side) | always |
| 1 | the smallest detected box covering the centre + a wider centre crop (65 %) | centre crop unsure, or the user retakes |
| 2 | every other detected object | still unsure, or a second retake |

Whole-frame detection keeps running (stream) or runs on the still, and supplies the level 1–2 boxes. If the best answer is confident and came from the centre/wide/covering box, it becomes a tile directly (other answers become the "fix the name" chips). Otherwise the choices go to the **scanner** instead of guessing (even a single unsure choice is confirmed there: hold = yes, double = retake). Guesses below a minimum score (`minShow`, placeholder 12 %) aren't offered unless the detector is fairly sure the object is there (`minDetector`, 50 %); if nothing clears the bar, the user gets "Not sure what that is. Try again or move closer" and an error buzz instead of a near-random word. Confidence is judged only on the pointed-at crops, and the choices are ordered by how likely they are to be what the user pointed at, not by how confident the name is: centre / covering-box / wide crops first (most confident of those leading), then other objects nearest the centre first. Choices with the same name are merged, and at most N are shown ("choices", default 4). If the object under the centre is tiny (< 1 % of the frame), a "Move closer" hint is shown; there's no special handling for far objects yet.

## Naming model: SigLIP 2 + daily-living vocabulary

Every crop is named by **SigLIP 2** (`onnx-community/siglip2-base-patch16-224-ONNX`, 4-bit `q4f16` vision model, 55 MB) zero-shot against **`src/data/vocabulary.ts`** — 637 everyday and AAC labels in 18 categories (people & body, food, kitchen, bathroom, health & medical incl. pill organizer / walker / hearing aid / glasses case, clothes, personal items, furniture, electronics, cleaning, tools, office, leisure, outdoors). Labels are the words a user would say; an optional prompt clarifies them ("remote" → "a TV remote control"). The same label may appear twice with different prompts ("fish" the animal and the food); the best one wins. Places and scenes ("restaurant") are deliberately not in it.

- **Text side, precomputed:** `npm run embed-vocab` encodes every label with 4 prompt templates (averaged) using the text model (283 MB, only on the developer's machine, ~30 s) and writes `public/vocab/siglip2-base-224.{bin,json}` (float16, ~1 MB, committed). Re-run it after editing the vocabulary; the app warns in the console if they're out of sync.
- **Image side, in the browser:** `siglip.worker.ts` runs in a Web Worker, WebGPU first, WASM fallback (`?siglip=wasm` to force, `?siglip=off` to disable). Model, config and ONNX runtime are served from `public/` (`npm run dev` downloads/copies them), so after the first run nothing is fetched from the internet. Load progress shows under the camera.
- **Scores:** `confidence` is a softmax over the vocabulary with SigLIP 2's learned scale (e^4.72 ≈ 113); top 3 become the name + "fix the name" chips. When unsure, the scanner also offers the next SigLIP guesses for the pointed-at crop, so even an object outside the vocabulary gets real choices.
- **Fallback:** if SigLIP isn't loaded or fails, the old EfficientNet/ImageNet classifier is used, cleaned by `core/imagenetMap.ts`: place/scene labels are dropped and over-specific ones mapped to everyday words (tabby → cat, quilt → blanket, notebook → laptop, dog breeds → dog). Claude refinement still runs on top when a key is set.
- **Speed (headless Chrome, M-series Mac):** ~0.1 s per press on WebGPU (0.2 s when it widens), 0.3–0.9 s on WASM with cross-origin isolation (`vite.config.ts` sets COOP/COEP so WASM can use threads; ~3× faster than without).

## Personal objects (`personal.ts`, `core/personalMatch.ts`)

A caregiver can teach Cue a specific object ("Mom's mug"): "Teach objects…" in the Camera & ring panel. Take 3–5 photos (ring click / Space = photo, double / D = undo, hold / H = save), type a name, save. Each photo stores two SigLIP 2 image embeddings: the centre crop and the smallest detected box under the aim point. Objects live in IndexedDB (`cue-personal` → `objects`: id, name, embeddings, thumbnail, createdAt, model) with an in-memory cache and change events; the same screen lists, renames and deletes them. Objects taught with a different model are kept but not matched.

At capture, every crop's embedding is compared with the taught objects first (cosine, nearest photo per object). A match needs cosine ≥ 0.85 and a lead of ≥ 0.02 over the next taught object (placeholders until the eval tunes them); its confidence is mapped to 0.6–1, so it is committed without the scanner, labelled with the taught name (source `personal`, tile says "taught"), and the vocabulary's top 3 become the "fix the name" chips. Claude refinement is skipped for taught names so it can't overwrite them. The console logs `[personal]` with the nearest cosine for each crop.

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

## Adding new hardware

1. Add `sources/MyCameraSource.ts` implementing `FrameSource` (copy `WebSocketSource.ts` for networked boards). Report status through `StatusEmitter`; use `collectBurst` / `withTimeout` so captures never hang.
2. If the button arrives separately, add a class to `input/inputs.ts` implementing `ButtonInput`.
3. Register it: `SourceKind` in `sources/types.ts`, `SOURCE_KINDS` in `settings.ts`, `createSource()` in `sources/index.ts` (buttons: the switch in `useVisionIO.ts`).
4. Select it in the "Camera & ring" panel or with `?source=...`, then set rotation/flip for each hand.
5. Run "Calibrate aim…" once per hand. If the hardware can buzz or beep, implement `feedback(kind)` on the source or button so the user gets "on target" and "got it".
