# Qu — Prototype

Camera-based AAC that turns what you point at into speech.

## Quick start

```bash
npm install
npm run dev        # copies MediaPipe wasm + downloads models into public/ on first run
```

Open **Chrome** at http://localhost:5173 and allow camera access. The first run also downloads the 55 MB SigLIP 2 recognition model into `public/models` (progress shows under the camera); after that everything works offline.

1. **Track** — the webcam shows live boxes around objects it recognises (80 COCO classes: cup, bottle, phone, laptop, book, banana, chair, person…). The focused object (hovered, or nearest the centre) has a solid box.
2. **Capture + identify** — press **Space** (the ring button). Qu names what is in the centre of the picture with SigLIP 2 against an everyday vocabulary ("mug", "water bottle", "remote") or a taught personal object ("Mom's mug"); if it isn't sure it offers a few choices (Space = next, H = choose, D = retake). **Clicking a box** names that box directly. The result appears as a tile with a thumbnail.
3. **Fix the name** (optional) — tap one of the alternative labels under a tile to rename it.
4. **Core word** — tap WANT / NO / MORE / GO / HELP / YES / QUESTION → 3 candidate sentences.
5. **Speak** — tap a sentence to say it aloud, or **Queue** it and press "Speak Now" later.

| Key | Action (simulates the ring) |
|---|---|
| Space | Capture + identify the focused object |
| D | Instant backchannel (cycles yes / no / haha / mm-hmm / wait / wow / okay / thanks) |
| H | Queue the first candidate sentence |

Under the camera, **Camera & ring** picks the camera source (webcam, Wi-Fi ring, Bluetooth ring, image files), photos per press, the ring button connection, hand, and rotation/flip. URL parameters work too, e.g. `?source=ws&url=ws://192.168.4.1:81/&mode=still`. Run `npm test` for unit tests.

Extras under the camera: **Say name on capture** (speaks the identified name), **Auto-speak queue at pause** (listens on the mic and speaks the queued sentence when your partner stops talking for ~0.7 s), a camera picker (when you have more than one), and a **Mirror** toggle (turn off if the camera faces away from you).

### Optional: Claude

Create `.env.local`:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

With a key, each capture is also sent to Claude Haiku 4.5 vision for an everyday name ("tv remote", "reusable water bottle"), and sentences come from Claude (template sentences show instantly, then get replaced). Without a key everything runs on-device. **The key is exposed to the browser — prototype only.**

### Troubleshooting

- **"Loading models…" forever / model error** — the first run needs internet to download models (`public/models/`). After that it works offline.
- **No boxes appear on your GPU** — open http://localhost:5173/?delegate=CPU to force CPU inference.
- **Camera denied** — click the camera icon in the address bar, allow, reload.

## Architecture

Everything runs in one browser tab. No backend.

```
Camera source (webcam / Wi-Fi ring / Bluetooth ring / files) ─► orientation (rotate/flip per source + hand)
  stream: ObjectDetector every frame ─► Tracker ─► overlay, "on target" cue, 10-frame buffer
  still:  burst of photos on press ─► sharpest photo ─► ObjectDetector once
Ring press ─► aim point + ranked candidates ─► name crops, centre first:
              taught personal objects ─► SigLIP 2 vs 637-label vocabulary (history-boosted order)
              ─► EfficientNet/ImageNet only if SigLIP is unavailable
  sure   ─► tile (+ optional Claude refinement)
  unsure ─► scanner with a few choices (+ Claude's guess when a key is set) ─► tile
Tile + core word ─► templates (instant) ─► (optional) Claude composer ─► sentences
Sentence ─► SpeechSynthesis
```

The recognition side (`src/vision/`) is documented in [src/vision/README.md](src/vision/README.md), including how to plug in new ring hardware.

### Evaluating recognition

```bash
npm run eval                                   # WebGPU and WASM, writes eval-results/
npm run eval -- --backends webgpu --no-personal --dirs test-images
```

Runs every image in `test-images/` (and `test-images-public/` if it exists; same `labels.json` format) through the same capture and naming code the ring uses, in headless Chrome, and reports top-1/top-3 accuracy, latency, which source answered, a confidence-threshold sweep, and a personal-object threshold sweep. The page itself is `http://localhost:5173/?eval=1` in `npm run dev`. Latest results: [eval-results/summary.md](eval-results/summary.md).

## Module structure

| File | Purpose |
|---|---|
| `src/components/CameraView.tsx` | Camera stream, detection loop, overlay drawing, click/Space targeting |
| `src/lib/detect.ts` | MediaPipe ObjectDetector (float16 model, GPU with CPU fallback) |
| `src/lib/tracker.ts` | Frame-to-frame tracker giving stable ids and smooth boxes |
| `src/lib/classify.ts` | MediaPipe ImageClassifier for fine-grained names (CPU) |
| `src/lib/identify.ts` | Crop + classify + choose label; Claude vision refinement |
| `src/lib/vision.ts` | Shared wasm loader, GPU→CPU fallback, local-model resolver |
| `src/lib/claude.ts` | Lazy Anthropic SDK client (only when a key is set) |
| `src/lib/compose.ts` | Template sentences + Claude composer (`Composer` interface) |
| `src/lib/speak.ts` | SpeechSynthesis + backchannels (`TTSEngine` interface) |
| `src/lib/listen.ts` | Energy-based pause detector for auto-speaking the queue |
| `src/lib/input.ts` | Keyboard → ring actions (wrapped by `KeyboardInput` in `src/vision/input`) |
| `src/data/vocabulary.ts` | 637 everyday/AAC labels SigLIP chooses from (re-run `npm run embed-vocab` after editing) |
| `src/vision/` | Camera sources (webcam, Wi-Fi, Bluetooth, files), ring button inputs, orientation, burst capture, aim/candidates, SigLIP naming, personal objects, selection history, eval harness — see [src/vision/README.md](src/vision/README.md) |
| `src/components/PersonalObjects.tsx` | Teach, rename and delete personal objects ("Teach objects…" in the Camera & ring panel) |
| `src/components/SourceSettings.tsx` | "Camera & ring" panel: source, photos per press, button, hand, rotation/flip |
| `src/lib/store.ts` | useReducer state |
| `scripts/` | `copy-wasm.mjs`, `fetch-models.mjs` (run automatically before dev/build), `mock-ring.mjs` (fake Wi-Fi ring for testing), `embed-vocab.mjs` (vocabulary text embeddings), `eval.mjs` (recognition eval) |

## Extension points

1. **Ring hardware** — implement `FrameSource` / `ButtonInput` in `src/vision/` (see "Connecting new hardware" in [src/vision/README.md](src/vision/README.md)); Wi-Fi and Bluetooth versions exist with placeholder protocols
2. ~~ElevenLabs TTS~~ — done: `src/lib/tts.ts` (through the hub), see the care loop below
3. **Better VAD** — swap the energy detector in `listen.ts` for vad-web/Silero
4. **Partner transcription** — feed Web Speech API text into `ComposeInput.partnerContext`


## Qu communication loop (sponsor integrations)

One demo scene: the user points at something and Qu says their sentence in their own cloned voice (ElevenLabs); a sentence can also go privately to someone as an iMessage (Photon), whose reply is read aloud. **I need help** (header button, or ring hold with nothing queued) says it out loud or texts a contact. Plan and phase status: [docs/care-loop.md](docs/care-loop.md).

| Part | Where | Run |
|---|---|---|
| Browser app (camera, naming, sentences, UI) | `src/` | `npm run dev` |
| Hub (ElevenLabs, Photon; keys live here) | `server/` | `npm run hub` |
| Phone as the ring | `phone/` (Expo) | `cd phone && npx expo start` |

Tests: `npm test` (browser + hub).
