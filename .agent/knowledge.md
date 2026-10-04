# Verified Knowledge

## MediaPipe Tasks Vision (browser) — @mediapipe/tasks-vision 1.0.1

- Wasm served locally from `public/mediapipe/wasm` (copied from node_modules by `scripts/copy-wasm.mjs`) — avoids `@latest` CDN version drift
- Models downloaded to `public/models` by `scripts/fetch-models.mjs`; app falls back to storage.googleapis.com
- Detector: `efficientdet_lite0/float16/1` on GPU works. **int8 detector on GPU returned 0 detections** (headless Chromium/SwiftShader) — avoid
- Classifier: `efficientnet_lite0/int8/latest` **throws on GPU** ("TensorsDequantizationCalculator: Unsupported input tensor type: Float32") — run on CPU
- `detectForVideo(video, ts)` requires strictly increasing timestamps
- `BoundingBox` = `originX, originY, width, height` in pixels of the input frame
- ImageNet display names can contain commas ("notebook, notebook computer") — take the first
- ImageNet has no "person" class — keep the COCO detector label for people
- MediaPipe posts telemetry to `odml.pa.googleapis.com` (failures are harmless)

## Browser SpeechSynthesis

- `speechSynthesis.speak(utterance)` async, fires `onend`; `cancel()` stops
- May require a prior user gesture

## Anthropic SDK in the browser

- `new Anthropic({ apiKey, dangerouslyAllowBrowser: true })`; model id `claude-haiku-4-5`
- Image input: `{ type: "image", source: { type: "base64", media_type: "image/jpeg", data } }`
- Vite tree-shakes the lazy SDK import when `VITE_ANTHROPIC_API_KEY` is unset at build time

## Tailwind v4 with Vite

- Plugin `@tailwindcss/vite`; `@import "tailwindcss";` in index.css; no config file

## Testing in the agent sandbox

- Headless Chromium: `--proxy-server=https=<proxy host:port>` so http://127.0.0.1 is not proxied (Playwright's `proxy` option adds `<-loopback>`)
- Fake webcam: override `navigator.mediaDevices.getUserMedia` to return `canvas.captureStream()` of a still image
- Fetch models with `NODE_USE_ENV_PROXY=1`

## SigLIP 2 in Transformers.js 4.3 (verified 2026-10-03)

- `onnx-community/siglip2-base-patch16-224-ONNX` has separate `vision_model_*.onnx` / `text_model_*.onnx`; load with `SiglipVisionModel` / `SiglipTextModel`, use `pooler_output`
- Text must be tokenized with `padding: "max_length", max_length: 64` (Gemma tokenizer)
- logit_scale = 4.724453 (exp ≈ 112.7), logit_bias = −16.7717 (read from google/siglip2-base-patch16-224 safetensors header)
- **`vision_model_quantized`/`q8` is broken** (cat image → "purse"); `q4f16` ≈ `fp16` in accuracy; text `q8` ≈ text `fp16`
- Transformers.js defaults ORT wasm to jsDelivr; set `env.backends.onnx.wasm.wasmPaths` to local `ort-wasm-simd-threaded.asyncify.{mjs,wasm}` for offline
- WebGPU works in headless Chrome on macOS; WASM is ~3× faster with COOP/COEP (cross-origin isolated → threads)

## ElevenLabs (verified 2026-10-03 with a restricted key)

- Auth header `xi-api-key`; secret keys are `sk_` + 51 chars total. The key *ID* shown in the dashboard is rejected (`api_key_id_used_as_api_key`); a wrong length gives `invalid_api_key_length`.
- TTS: `POST /v1/text-to-speech/{voice_id}[/stream]?output_format=mp3_44100_64`, body `{text, model_id}`. Models `eleven_flash_v2_5`, `eleven_v3` both work; v3 accepts `[laughs]`.
- Latency from the dev laptop: first byte 0.25 s via the hub on a warm connection, 0.8-1.4 s cold; hence cached clips for reactions.
- Instant clone: `POST /v1/voices/add` multipart `name` + `files` (+ `remove_background_noise`) -> `{voice_id, requires_verification}`.
- Scribe realtime: `POST /v1/single-use-token/realtime_scribe` returned a token; model id `scribe_v2_realtime`.
- A restricted key can lack `user_read` (`/v1/user/subscription` returns 401) and still do TTS/voices.

## Photon Spectrum (spectrum-ts 12.10.1, verified 2026-10-03 against docs + compiler)

- `npm i spectrum-ts`; `import { Spectrum, Emoji } from "spectrum-ts"; import { imessage } from "spectrum-ts/providers/imessage"`.
- `const app = await Spectrum({ projectId, projectSecret, providers: [imessage.config()] })` (or env `SPECTRUM_PROJECT_ID` / `SPECTRUM_PROJECT_SECRET`). Cloud mode needs Node or Bun.
- Receive: `for await (const [space, message] of app.messages)`; `message.direction` is "inbound"/"outbound"; `message.content.type === "text"` -> `.text`; `message.sender?.id`.
- Proactive send: `const im = imessage(app); const dm = await im.space.create(await im.user("+1555..."))`; `await dm.send("text")`.
- Tapback: `await message.react(Emoji.love | like | dislike | laugh | emphasize | question)`; needs the cloud package.
- `server/messages.ts` compiles against these (tsc is the verification); NOT run against real Photon yet.

## Photon CLI and shared-pool iMessage (verified 2026-10-03)

- Package `@photon-ai/cli` (run via npx). `projects create --name X --platforms imessage [--json]` -> `{id, name, env}`; `projects secret <id> --json` -> `{id, projectSecret}`; `spectrum users add --first-name --last-name --email --phone [--invite]` (all four required non-interactively); `spectrum users ls --json` includes `assignedPhoneNumber`.
- Free-plan send needs the target registered as a user AND (in our test) an inbound text from them to the assigned line seen by the connected hub; then `POST /messages/send` -> `{"sent":true,"mode":"photon"}`. A real text arrived on the phone.
- Hub env: `SPECTRUM_PROJECT_ID`, `SPECTRUM_PROJECT_SECRET` in server/.env.local; never print the secret.
