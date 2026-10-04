# Care loop: sponsor integrations

One demo scene, four sponsors: Dad points at his pill bottle -> Qu checks his health record (FinchNode) and speaks the answer in his cloned voice (ElevenLabs) -> he long-presses to say he's in pain -> an agent checks his meds and decides (Fetch.ai) -> his daughter gets an iMessage and her reply is read aloud to him (Photon).

## Architecture

```
ring / browser  <--ws /ring-->  hub (server/, :8787)  --->  ElevenLabs (voice, Scribe)
   (recognition,                    |  keys in             --->  Photon / Spectrum (iMessage)
    compose, UI)                    |  server/.env.local   --->  FinchNode demo API
                                    +--- HTTP --->  agents/ (uAgents: Care, Meds, Notify) ---> Agentverse / ASI:One
```

Offline stays working: with the hub down the browser uses templates and SpeechSynthesis.

## Sequences already in the browser (what the phases plug into)

| Sequence | Where | Plug-in point |
|---|---|---|
| Ring press -> `InputAction` (click/double/hold) -> `RING_MAPPINGS` mode table | `src/vision/input/*`, `App.handleInput` | Hub emits the same `{"type":"button","action"}` messages |
| Click -> `nameTarget` (centre crop, widen if unsure) -> scanner or tile | `src/vision/naming.ts`, `App.ringCapture` | `commitCapture` is where "medication mode" hooks in |
| Core word -> `composeMock` then Claude -> candidates | `src/lib/compose.ts` | Pass `partnerContext` from Scribe transcript |
| Hold -> queue -> speak at pause (energy VAD) | `src/lib/listen.ts`, `App` | Replace VAD with Scribe silence events |
| Speak / backchannel | `src/lib/speak.ts` `TTSEngine` | `ElevenLabsTTS` implements the existing interface |

## Phases

| # | Phase | Owner | Status |
|---|---|---|---|
| 0 | Hub + fake ring events (`npm run hub`) | A | done |
| 0b | Phone as the ring (`phone/` Expo app, hub relay) instead of hardware | A | done, needs a real-phone test |
| 1 | ElevenLabs: voice clone, cached v3 reactions, Flash v2.5 streaming via hub, `src/lib/tts.ts` | A | built; clone waiting on a voice sample |
| 2 | FinchNode: pick patient, medication mode (bottle -> label -> match list/allergies), clinic summary | B | built; label reading needs `ANTHROPIC_API_KEY` |
| 3 | Photon: send messages, QR recipients, tapbacks, replies read aloud | A | built; real iMessage send + receive verified (one real number) |
| 4 | Fetch.ai: Care / Meds / Notify uAgents, chat protocol, Agentverse, ASI:One | B | built and tested locally; Agentverse mailbox + ASI:One need your account |
| 5 | Scribe realtime: partner transcript + pause detection; hub <-> agents <-> Photon wiring | A+B | |
| 6 | Real ring, rehearsal, video, Devpost | all | |

Cut order if behind: Scribe -> Interactive Cards -> caregiver-started Fetch flow -> Photon QR targeting.

## Rules for each phase

- Verify each sponsor's current docs before coding against them; record verified facts in `.agent/knowledge.md`.
- Keys only in `server/.env.local` (gitignored). Never `VITE_`-prefix a sponsor key.
- Voice cloning: a teammate's voice, framed as "recorded before the stroke". No real patients or public figures.

## Phone as the ring (no hardware)

```
phone/ (Expo)  --ws /phone-->  hub :8787  --ws /ring-->  browser (SigLIP naming, scanner, sentences)
 camera + one button           relays both ways          source = "Wi-Fi camera" (still) + button = ws
```

1. Laptop: `npm run hub`. It prints `phone app URL: ws://<laptop-ip>:8787/phone`.
2. Laptop: `npm run dev`, then open `http://localhost:5173/?source=ws&mode=still&url=ws://localhost:8787/ring&button=ws`.
3. Phone (same Wi-Fi): `cd phone && npx expo start`, open in Expo Go, enter the URL from step 1, Connect.
4. On the phone: tap = click (take picture), double tap = double (quick reply), hold = hold (queue sentence). The browser asks the phone for photos, names them, and sends buzz feedback back to the phone.

Same-network only. If the phone cannot reach the laptop, put the hub behind a tunnel (e.g. `cloudflared tunnel --url http://localhost:8787`, then use `wss://<host>/phone`).

## Phase 1: voice (ElevenLabs)

- Key in `server/.env.local` as `ELEVENLABS_API_KEY=sk_...` (51 chars, the secret, not the key ID). The hub never sends it to the browser.
- `npm run voice -- status | reactions | clone <audio files> --name "Dad"`. `clone` saves the voice id to `server/voice.json` (gitignored); or set `ELEVENLABS_VOICE_ID`. With neither, a stock voice (Sarah) is used.
- Reactions: `npm run voice -- reactions` writes `public/reactions/*.mp3` + `manifest.json` with Eleven v3 (so `haha` is `[laughs] Ha ha ha!`). The browser plays them locally. Re-run it after cloning so they use the new voice.
- Sentences: browser -> `POST /voice/speak` -> Flash v2.5 streamed back as mp3. Falls back to browser SpeechSynthesis after 4 s or on any error.

## Phase 2: medication mode and clinic mode (FinchNode)

- Data: FinchNode public demo API `https://api.finchnode.com/demo/v1/users/{subject}/records` (no key, synthetic). Subject `patient-demo-polypharmacy` (Harriet Lindqvist, synthetic, 78): 14 active medications, 10 conditions, allergies sulfonamide and contrast media, acetaminophen as needed for knee pain. Override with `FINCHNODE_SUBJECT`. If the network is down the hub uses `server/fixtures/polypharmacy.json`.
- The record has no "last taken" times (`medicationAdministrations` is empty). Phase 4 needs Qu's own dose log for "last taken 9 hours ago".
- Medication mode: SigLIP names a crop `pill bottle` / `pills` / `medicine` / `liquid medicine` / `pill organizer` (also when the user renames a tile to one of those) -> the browser sends the full-size crop to `POST /meds/check` -> Claude vision (`server/label.ts`, needs `ANTHROPIC_API_KEY` in `server/.env.local`) reads drug + strength -> `server/meds.ts` checks allergies, then the medicine list, then strength -> the verdict is spoken in the cloned voice and shown as a green/amber/red card.
- Safe by default: an unreadable label, an unknown drug, an allergy hit, or a different strength all say "don't take it". Only an exact list match says how to take it.
- "Check medicine" button: type the name (and strength) when the bottle can't be photographed or recognised. Works without the vision key.
- Clinic mode: "Clinic summary" button -> `POST /meds/clinic` with the sentences the user spoke this session -> conditions, allergies, medicines, as-needed medicines, and "in the patient's own words". Copy button.
- Allergy matching uses a small curated class list in `server/meds.ts` (sulfonamide, penicillin, NSAIDs, codeine). It is a demo aid, not a clinical database.

## Phase 3: private messages (Photon Spectrum / iMessage)

- Credentials: `SPECTRUM_PROJECT_ID` and `SPECTRUM_PROJECT_SECRET` in `server/.env.local` (Photon docs: `photon login`, `photon projects create --name "Qu" --location us-east --spectrum`, `photon projects regenerate-secret <project-id>`; the CLI install command was not in the docs I read). Without them the hub runs in **dry-run**: messages are logged, not sent, and `POST /messages/dev/incoming` simulates a text.
- Contacts: `QU_CONTACTS="Maya:+17345550100,Dr. Patel:+17345550101"` in `server/.env.local`, or `POST /messages/contacts {name, phone}`. Saved in `server/contacts.json` (gitignored; phone numbers never go to the browser).
- QR targeting: the contact opens `http://<laptop-ip>:8787/q/<contactId>` on their phone (the share links are in `GET /messages/status`), which shows a QR code. When the ring camera sees it, Qu reads it instead of naming an object: banner "Private to Maya", nothing is spoken, the next picked sentence (or ring hold = top sentence) is texted to them, then it returns to normal. Chips next to the camera do the same by tapping.
- Replies: an inbound iMessage is read aloud in a calm, slower reader voice (`reader: true` on `/voice/speak`, `ELEVENLABS_READER_VOICE_ID`, default Sarah, speed 0.85) and shown in a card with six tapback buttons.
- Ring double-click = tapback: while a text is fresh (60 s, not yet reacted to) the ring mode is `message`, so double-click sends a thumbs-up tapback instead of the in-person "Yes" reaction.
- Photon free plan (from their docs): shared number pool, no group chats, 50 new conversations per line per day, 5,000 messages per server per day.
- Not secured: the hub has no authentication. Run it only on a trusted network; contact ids are unguessable but the routes are open.

## Phase 4: Fetch.ai agents

- Python must be **3.13**: `uagents` 0.25.5 fails on 3.14 at `Agent(...)` ("There is no current event loop"). `agents/.venv` is built with `/opt/homebrew/bin/python3.13`.
- Flow A (patient): browser -> `POST /care/pain` -> hub queue -> Care agent polls `GET /care/next` every 2 s -> asks Meds (`PainContextRequest` -> `MedsContext`) -> `decide_pain` (agents/logic.py) -> Notify (`NotifyRequest` -> `NotifyResult`) -> `POST /care/say` so the user hears the outcome. Pain >= 8 is escalated as URGENT whatever the medicine list says; an unknown last dose never claims a dose is allowed.
- Flow B (caregiver in ASI:One): Care handles `ChatMessage` (acknowledges, parses intent with plain rules, replies with `TextContent` + `EndSessionContent`): summary, medicines, "tell him ..." (read aloud on his Qu).
- Dose times: FinchNode has none, so the hub keeps a dose log (`server/care.ts`), seeded in demo with the as-needed pain medicine taken 9 h ago, and "I took it" on a matched medicine card records a real one.
- Ring: hold with nothing to queue opens the pain panel (click = next level 1-10, hold = send, double = close). With sentence suggestions on screen, hold still queues the top one.
- **Your steps (need your Agentverse account):** (1) `cd agents && .venv/bin/python run.py` (without `QU_LOCAL_ONLY`), (2) open the Agent Inspector link it logs for the Care agent and choose Connect -> Mailbox, (3) find the agent on Agentverse, check the README/handle and the Innovation Lab category, (4) chat with it from ASI:One, (5) submit via the "MHacks ASI:One Submission Agent" and Devpost, with the 3-5 minute video.
- If the inspector page says "Could not find this Agent on your local host" (the https page cannot reach `127.0.0.1`: Safari/Brave/Chrome local-network blocking), connect from the terminal instead: put `AGENTVERSE_API_KEY=...` in `agents/.env`, keep `npm run agents` running, then `cd agents && .venv/bin/python connect_mailbox.py`. It makes the same `/connect` call the inspector does (tested with a dummy token: reaches Agentverse and is rejected with "Could not validate credentials"; not tested with a real key).
- Promo code on the official MHacks hackpack page: `MHACKS26MHACKS26AV` (the code in the planning notes was missing characters).
- Not built (cut order): Interactive Cards. Meds/Notify are local to the Bureau, not separately registered on Agentverse.

### Photon setup as it actually worked (2026-10-03)

- `npm install -g @photon-ai/cli` fails with EACCES on this Mac; use `npx @photon-ai/cli <command>` instead. `login` opens a device-approval page.
- The docs' `projects create --spectrum --location us-east` is out of date for CLI 1.x: use `projects create --name "Qu" --platforms imessage` (default location "United States"). `projects secret <id>` prints the Spectrum secret without rotating it.
- Free plan = shared pool. Each recipient must be a Spectrum **user** (`spectrum users add` needs first name, last name, email, phone). The user record gets an `assignedPhoneNumber` (Photon's line for them: `spectrum users ls --json`).
- Sending to a user was rejected with "Target not allowed for this project" until that person had texted their assigned line **while the hub was running** (the hub then logs `[messages] inbound from <name>`). Likely cause, not confirmed: the conversation only opens once a connected client sees their first message. If sends fail again: restart the hub, have them text the line, retry.
- Check the registered handle with https://debug.photon.codes (it replies with the exact address Apple sends from).
- No iMessage "line" had to be added (`spectrum lines ls` is empty on the free plan).
