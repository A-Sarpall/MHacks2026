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
