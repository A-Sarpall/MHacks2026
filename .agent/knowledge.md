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

## FinchNode (verified 2026-10-03 against the live API)

- Public demo API `https://api.finchnode.com/demo/v1`: no key, CORS `*`. `GET /scenarios` (kind `record` | `behavior` | `session`, with `subject` + `persona.displayName`), `GET /users/{subject}/records`
- Record: `data.{demographics, medications, conditions, allergies, appointments, careTeam, encounters, vitals, labs, ...}`, `sources[].organization`, `meta.dataAsOf`, `synthetic: true`
- Medication names are RxNorm strings ("NDA021457 200 ACTUAT albuterol 0.09 MG/ACTUAT Metered Dose Inhaler") or free text in `messy-coding` ("blood pressure pill, 1 daily", no codes)
- `multi-source-overlap` repeats meds/conditions across two sources; dedupe. Only `baseline-adult` has appointments and careTeam
- Unknown subject → 404; rate limit → 429 with `Retry-After`. Full spec: https://finchnode.com/openapi.yaml, docs index: https://finchnode.com/llms.txt
- Production API (`/api/v1`) needs a server-side `ck_test_`/`ck_live_` key — never in Vite env
- On-device ImageNet classifier labels a real pill-bottle photo "pill bottle" (Wikimedia "Nateglinide 60 mg bottle" image)
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

## FinchNode public demo API (verified 2026-10-03)

- Base `https://api.finchnode.com/demo/v1`, no auth, CORS open, 120 req/min per IP. `GET /scenarios` lists 12 (6 record, 4 behavior, 2 connect-session); `GET /users/{subject}/records[?categories=a,b]` -> `{ data: { demographics, allergies, medications, conditions, vitals, labs, ... } }`.
- Medication fields: `name` (RxNorm text), `dosage` (free text), `status`, `startDate`, `endDate`; `frequency` and `reason` are usually null. Allergies: `substance`, `reaction`. Conditions: `name`, `status`.
- Most medications: `patient-demo-polypharmacy` (14 active). `patient-demo-sparse` is empty. `medicationAdministrations` is empty everywhere checked.

## Photon Spectrum (spectrum-ts 12.10.1, verified 2026-10-03 against docs + compiler)

- `npm i spectrum-ts`; `import { Spectrum, Emoji } from "spectrum-ts"; import { imessage } from "spectrum-ts/providers/imessage"`.
- `const app = await Spectrum({ projectId, projectSecret, providers: [imessage.config()] })` (or env `SPECTRUM_PROJECT_ID` / `SPECTRUM_PROJECT_SECRET`). Cloud mode needs Node or Bun.
- Receive: `for await (const [space, message] of app.messages)`; `message.direction` is "inbound"/"outbound"; `message.content.type === "text"` -> `.text`; `message.sender?.id`.
- Proactive send: `const im = imessage(app); const dm = await im.space.create(await im.user("+1555..."))`; `await dm.send("text")`.
- Tapback: `await message.react(Emoji.love | like | dislike | laugh | emphasize | question)`; needs the cloud package.
- `server/messages.ts` compiles against these (tsc is the verification); NOT run against real Photon yet.

## Fetch.ai uAgents (verified 2026-10-03)

- `uagents==0.25.5` (doc-pinned; 0.26.0 exists). Runs on Python 3.13.5; **fails on 3.14.7** at `Agent()` (asyncio `get_event_loop`).
- Chat protocol: `from uagents_core.contrib.protocols.chat import ChatMessage, ChatAcknowledgement, TextContent, StartSessionContent, EndSessionContent, chat_protocol_spec`; `Protocol(spec=chat_protocol_spec)`; `agent.include(protocol, publish_manifest=True)`; `Agent(name, seed, port, mailbox=True, publish_agent_details=True, description=, readme_path=)`. Reply = ack (`ChatAcknowledgement(acknowledged_msg_id=msg.msg_id)`) then `ChatMessage(content=[TextContent(type="text", text=...), EndSessionContent(type="end-session")])`.
- Agents in one `Bureau` message each other locally (no endpoints needed); Bureau supports mailbox agents. `ctx.send_and_receive(dest, msg, response_type=Model, timeout=)` returns `(msg|None, status)`. Address from seed: `uagents.crypto.Identity.from_seed(seed, 0).address`.
- MHacks 2026 hackpack (innovationlab.fetch.ai/events/hackathons/mhacks-2026/hackpack): must register an agent on Agentverse, implement the chat protocol, be usable in ASI:One with the primary workflow completed inside an ASI:One conversation; submit Devpost + "MHacks ASI:One Submission Agent"; README with agent names/addresses and the two badge lines; 3-5 min video; promo `MHACKS26MHACKS26AV`.

## Ring onboarding (verified 2026-10-04)

- ESP32-CAM ring Wi-Fi AP: SSID `Qu-Ring`, password `12345678`, WebSocket at `ws://192.168.4.1:81/`
- Protocol unchanged from `src/vision/README.md`: binary JPEGs, `{"type":"capture","count":N}`, `{"type":"burst-end"}`, `{"type":"button","action":"click|double|hold"}`, `{"type":"feedback","kind":...}`
- Ring has button (click/double/hold) and vibration motor (driven by feedback). No IMU.
- Backup web remote: `http://192.168.4.1` (click/double/hold, vibration test, camera test, `/status` JSON)
- Default `wsUrl` = `ws://192.168.4.1:81/`, default `wsMode` = `stream` (live preview)
- `StatusInfo.status` field (not `.state`) for connection status: `idle | connecting | live | reconnecting | error`

## Photon CLI and shared-pool iMessage (verified 2026-10-03)

- Package `@photon-ai/cli` (run via npx). `projects create --name X --platforms imessage [--json]` -> `{id, name, env}`; `projects secret <id> --json` -> `{id, projectSecret}`; `spectrum users add --first-name --last-name --email --phone [--invite]` (all four required non-interactively); `spectrum users ls --json` includes `assignedPhoneNumber`.
- Free-plan send needs the target registered as a user AND (in our test) an inbound text from them to the assigned line seen by the connected hub; then `POST /messages/send` -> `{"sent":true,"mode":"photon"}`. A real text arrived on the phone.
- Hub env: `SPECTRUM_PROJECT_ID`, `SPECTRUM_PROJECT_SECRET` in server/.env.local; never print the secret.
