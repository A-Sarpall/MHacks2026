# Current State

## Objective

Working demo: live webcam object tracking -> click a box (or Space) to capture + identify -> tile -> core word -> sentences -> speech.

## Status: demo-ready (branch claude/dazzling-bohr-oazch0)

Done:
- Local wasm + downloaded models (scripts/, run by predev/prebuild), CDN fallback
- Live tracking: detector VIDEO mode + IoU tracker + canvas overlay, adaptive throttle
- Click/Space capture -> crop -> ImageNet classifier (CPU) -> tile with thumbnail + rename alternatives; optional Claude Haiku vision
- Template sentences instantly, Claude composer replaces them when key set
- Toast "Identified: X", mirror toggle, camera picker, say-name toggle, auto-speak-at-pause (energy VAD)
- README / knowledge / DECISIONS updated

## Verified (headless Chromium, fake webcam from still images dog.jpg / fruits.jpg, 4:3 and 16:9)

- Tracking boxes, Space capture, click capture, empty-space click, dedupe, toast, sentences, speak returns to Ready
- Invalid Claude key -> graceful on-device fallback
- Pause detector fires 0.7s after synthetic speech ends (sandbox mic itself unavailable)
- Fresh clone: npm install && npm run build downloads models and builds

## Not verified here

- Real webcam, real audio output, real Claude responses (no key in sandbox), GPU drivers on user's machine

## FinchNode health record (2026-10-03, branch sponsor-features)

Done: `src/lib/health.ts`, `HealthPanel`, `HealthAlerts`; health context in `compose.ts` + Claude vision hints; `?patient=<scenario>`.
Verified (Docker: node:22 build + lint; Playwright headless Chromium with fake webcam pill-bottle image, mocked Anthropic API): 14/14 checks — record card, clinic phrases, pill bottle → medicine chips → med sentences, visit log + clipboard notes, patient switch, allergy alert + refusal-only sentences with the Claude composer skipped, medicine + record in composer/vision prompts.
Not verified: real Claude responses, real webcam, audio.

## Next ideas

- Partner transcription (Web Speech API) -> partnerContext
- Silero VAD, ElevenLabs, ring client

## 2026-10-03 care-loop work (branch cv-pipeline)

- Phase 0 hub done (`server/`, `npm run hub`). Phone-as-ring done: `phone/` Expo app + hub relay (`/phone` <-> `/ring`). Relay verified with ws clients; not yet run with a real phone or the browser UI.
- Next: Phase 1 (ElevenLabs) once `ELEVENLABS_API_KEY` + a voice sample exist.
- Phase 1 built: server/voice.ts + voice-cli.ts, /voice/status, /voice/speak, src/lib/tts.ts wired into App, public/reactions/ generated with the stock voice. Browser fallback verified in headless Chrome; ElevenLabs path verified via curl through the hub before the key in .env.local lost a character (now 50 chars). Waiting on: fixed key, voice sample for `voice clone`, then Phase 2/3.
- Phase 2 built: server/{finch,meds,label}.ts + /meds/{profile,check,clinic}, server/meds.test.ts (10 tests), src/lib/meds.ts, MedCard, ClinicPanel, App hooks. Verified: live FinchNode via hub, typed check + clinic panel in headless Chrome. NOT verified: photo label reading (no ANTHROPIC_API_KEY); SigLIP named the only pill-bottle test photo "salt" 12%, so auto-trigger from a real bottle is untested.
- Phase 3 built: server/{messages,routes-messages,http}.ts, QR page, /messages/*, reader voice, src/lib/{messages,qr,usePrivateMessaging}.ts, PrivateBar, IncomingCard, ring "message" mode. Verified in headless Chrome (dry-run): QR -> private target -> sentence sent -> inbound shown -> double-click tapback. 76 tests. NOT verified: real iMessage (no Photon credentials), real phone showing the QR.
- Phase 4 built: agents/ (care, meds, notify, models, hub client, logic + 12 unit tests, run.py Bureau, smoke.py), hub server/care.ts + routes-care.ts (+4 tests), browser PainPanel, "I took it", spoken-sentence log, ring pain mode. Verified: agents/smoke.py (8 checks, ASI:One stand-in over the real Chat Protocol), headless-Chrome E2E (ring hold -> pain 6 -> caregiver text -> user hears it). NOT verified: Agentverse mailbox connection, discovery/chat inside real ASI:One, the submission agent (need the user's Agentverse account).
- Photon live: project "Qu" (id kept in server/.env.local) created via CLI; credentials in server/.env.local; one Spectrum user (a teammate, real number kept out of the repo) with assigned line; inbound + outbound iMessage verified. Removed my stale fake contact (+1734555xxxx) from server/contacts.json. Next: reply -> read aloud in the app, QR on a real phone, ASI:One chat.

## FinchNode unified with the hub (2026-10-04)

Browser Health record panel and hub share one patient (`GET/POST /meds/patient`, `server/finch.ts` setSubject; fixture only for polypharmacy). A matched label check renames the tile to that medicine. Agents' wording is gender-neutral.
Verified: npm test (114), agents:test (12), typecheck:server, build, lint; Playwright in Docker with the real hub + live FinchNode: 22/22 (patient sync, clinic summary, typed check, pill bottle with/without label reading (mocked match), pain queue, on-device "peanut butter" 91% -> allergy refusals, hub down).
Not verified: real Claude label reading, ElevenLabs/Photon with keys, Agentverse.

## Scope change (2026-10-04)

FinchNode, medication/clinic modes, pain report and the Fetch.ai agents removed; "I need help" (say aloud / text a contact) replaces the pain panel. The FinchNode sections above are history.

## Sentence frames: model provider (2026-10-04)

`src/lib/frames/model.ts` is a deterministic on-device lexicon engine (no network, no model call): intent picks the skeleton (I [action] the X [detail]; Can you [action] the X [detail]?; Can I [action] the X [when]? or Is/Are the X [state] [detail]?; I feel [feeling] [context]), the namer's group/category/label pick the word banks (container vs liquid for drinks, "my" for medicine, plural copula, label overrides for chair/table/bed/keys/book/glasses/remote/toothbrush/phone/shoes), and the alternatives resolve the group for personal or unknown labels. Options are 4-6 per slot capped by `rules.maxOptions` (App.tsx still passes 4) and trimmed to the 8-word limit before `validateFrame`.
Verified: `npx vitest run src/lib/frames` (22 tests), `npm test`, `tsc -b`, oxlint, build; browser check with `?demo=` and `?frames=model`.
Decided against: hosted Claude frames (team wants vision-only input) and SigLIP state cues (measured unreliable, see knowledge.md).

## Hackathon close (2026-10-04, branch phase1-baselines, merged to main locally)

Shipped today: lexicon sentence frames (src/lib/frames/model.ts), six choices per slot, public test set (test-images-public, 359 images, 277 dev / 82 held-out untouched), layout check over 7 states x 4 viewports (24/28 pass), phone static audit, SigLIP q4 on WebGPU with threshold 0.65 (dev top-1 41.2% -> 48.7%, wrong auto-commits 32 -> 35 of 277). Measured baselines in eval-results/phase1 and the decision in DECISIONS.md.
Next: phase 2 of the brief (confident mistakes bed/blanket, tv/monitor, bowl/contents; the four iPhone cells still failing: help panel and incoming card need a scrolling or collapsing design; phone builder plumbing; ring path back to intents), then the held-out run once per source and backend. Grow held-out first: 82 images can only detect a 22-point top-1 change.
