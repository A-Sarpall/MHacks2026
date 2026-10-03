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
