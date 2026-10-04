# Layout check phase 1

Generated 2026-10-04T15:23:30.583Z. 24 passed, 4 failed (state x viewport). Checks: scroll, blocks, targets, text, motion, timers.

## Run notes (harness fix, two consecutive runs)

- How to run: `node scripts/layout-check.mjs --json` (or `npm run layout-check`) runs the full 7-state x 4-viewport matrix, rewrites this report and `phase1.json`, and exits 1 on any failing or not-reached cell. `--states=a,b` subsets. It starts its own Vite on port 5198 with HMR and the file watcher disabled (`hmr: false, watch: null`) and never touches the dev server on 5173. The script preserves this "Run notes" section from the previous report; only the tables below are regenerated.
- Two harness fixes in `scripts/layout-check.mjs` for the non-deterministic checks seen in the earlier critic run:
  - **help-panel NOT REACHED (`Cannot read properties of undefined (reading disconnect)`)**: `window.__layoutObserver` vanished during the 6 s window, i.e. the page reloaded in all four viewports at once. Opening the help panel only calls `setHelpOpen(true)` (no navigation, form or anchor), so the reload was a Vite full-reload broadcast, not app behaviour. The harness Vite server now runs with HMR and the file watcher off so no file change (other evals write to `eval-results/`, `public/`) can trigger a reload; the observer read-back returns null instead of throwing when the global is missing; a `load` event or null observer during the window re-reaches the state (goto, reach, settle) up to three times, and only after three reloads is it recorded as a `timers` finding (`reload document xN`), never as a crash. Successful retries are kept in `raw.reloads` in `phase1.json`.
  - **incoming-message timers flipping PASS/FAIL**: the StatusBar model pill changed `Loading models... -> Ready` (class `text-gray-500 -> text-gray-600`) inside the window. Every state now waits (up to 60 s) until no element reads `Loading models...`, in addition to the existing `[data-testid=track-info]` wait, before the 800 ms settle, the audit and the 6 s window.
- Determinism: two consecutive full runs, run 1 10:57:13-10:58:21 EDT (67 s, saved as `.cache-phase1/phase1-run1.json`) and run 2 10:58:21-10:59:31 EDT (70 s, this report), both reached all 28 cells, with identical pass/fail for every check in every cell (0 differences) and no reload retries in either run.
- Final counts (both runs): 10 cells passed, 18 cells failed. Failing checks by kind: text 16, targets 8, blocks 6, scroll 0, motion 0, timers 0. The failures are layout findings (small sentence text on the iPhones and in the help panel, the 36x32 px help Close button, builder/candidates clipped below the fold on the iPhones), not harness flakiness.
- `[data-testid=candidates]` is intentionally absent in nothing-captured (Candidates.tsx returns null with no candidates) and is checked as expected-absent there, not as a required block.
- Not covered by this matrix: setup view, objects drawer, the non-demo capture flow, colour contrast, and the phone/ app (see eval-results/layout/phone-report.md).

| state | viewport | scroll | blocks | targets | text | motion | timers |
|---|---|---|---|---|---|---|---|
| nothing-captured | iphone-393x852 | PASS | PASS | PASS | PASS | PASS | PASS |
| nothing-captured | iphone-375x667 | PASS | PASS | PASS | PASS | PASS | PASS |
| nothing-captured | ipad-portrait-820x1180 | PASS | PASS | PASS | PASS | PASS | PASS |
| nothing-captured | ipad-landscape-1180x820 | PASS | PASS | PASS | PASS | PASS | PASS |
| captured-no-intent | iphone-393x852 | PASS | PASS | PASS | PASS | PASS | PASS |
| captured-no-intent | iphone-375x667 | PASS | PASS | PASS | PASS | PASS | PASS |
| captured-no-intent | ipad-portrait-820x1180 | PASS | PASS | PASS | PASS | PASS | PASS |
| captured-no-intent | ipad-landscape-1180x820 | PASS | PASS | PASS | PASS | PASS | PASS |
| intent-chosen | iphone-393x852 | PASS | PASS | PASS | PASS | PASS | PASS |
| intent-chosen | iphone-375x667 | PASS | PASS | PASS | PASS | PASS | PASS |
| intent-chosen | ipad-portrait-820x1180 | PASS | PASS | PASS | PASS | PASS | PASS |
| intent-chosen | ipad-landscape-1180x820 | PASS | PASS | PASS | PASS | PASS | PASS |
| builder-slot-filled | iphone-393x852 | PASS | PASS | PASS | PASS | PASS | PASS |
| builder-slot-filled | iphone-375x667 | PASS | PASS | PASS | PASS | PASS | PASS |
| builder-slot-filled | ipad-portrait-820x1180 | PASS | PASS | PASS | PASS | PASS | PASS |
| builder-slot-filled | ipad-landscape-1180x820 | PASS | PASS | PASS | PASS | PASS | PASS |
| overstimulated | iphone-393x852 | PASS | PASS | PASS | PASS | PASS | PASS |
| overstimulated | iphone-375x667 | PASS | PASS | PASS | PASS | PASS | PASS |
| overstimulated | ipad-portrait-820x1180 | PASS | PASS | PASS | PASS | PASS | PASS |
| overstimulated | ipad-landscape-1180x820 | PASS | PASS | PASS | PASS | PASS | PASS |
| help-panel | iphone-393x852 | PASS | FAIL | PASS | PASS | PASS | PASS |
| help-panel | iphone-375x667 | PASS | FAIL | PASS | PASS | PASS | PASS |
| help-panel | ipad-portrait-820x1180 | PASS | PASS | PASS | PASS | PASS | PASS |
| help-panel | ipad-landscape-1180x820 | PASS | PASS | PASS | PASS | PASS | PASS |
| incoming-message | iphone-393x852 | PASS | FAIL | PASS | PASS | PASS | PASS |
| incoming-message | iphone-375x667 | PASS | FAIL | PASS | PASS | PASS | PASS |
| incoming-message | ipad-portrait-820x1180 | PASS | PASS | PASS | PASS | PASS | PASS |
| incoming-message | ipad-landscape-1180x820 | PASS | PASS | PASS | PASS | PASS | PASS |

## Failures

### help-panel / iphone-393x852

Screenshot: eval-results/layout/help-panel-iphone-393x852.png

- **blocks**: not fully in view: candidates (864-868px), builder (688-856px); candidates fully visible 0/4

### help-panel / iphone-375x667

Screenshot: eval-results/layout/help-panel-iphone-375x667.png

- **blocks**: not fully in view: candidates (713-717px), builder (561-709px); candidates fully visible 0/4

### incoming-message / iphone-393x852

Screenshot: eval-results/layout/incoming-message-iphone-393x852.png

- **blocks**: not fully in view: candidates (959-963px), builder (783-951px), build option (841-893px); candidates fully visible 0/4

### incoming-message / iphone-375x667

Screenshot: eval-results/layout/incoming-message-iphone-375x667.png

- **blocks**: not fully in view: intents (580-676px), candidates (832-836px), builder (680-828px), build strip (680-732px), build slot (684-728px), build say (680-732px), build option (736-780px); candidates fully visible 0/4

## Screenshots

- eval-results/layout/nothing-captured-iphone-393x852.png
- eval-results/layout/nothing-captured-iphone-375x667.png
- eval-results/layout/nothing-captured-ipad-portrait-820x1180.png
- eval-results/layout/nothing-captured-ipad-landscape-1180x820.png
- eval-results/layout/captured-no-intent-iphone-393x852.png
- eval-results/layout/captured-no-intent-iphone-375x667.png
- eval-results/layout/captured-no-intent-ipad-portrait-820x1180.png
- eval-results/layout/captured-no-intent-ipad-landscape-1180x820.png
- eval-results/layout/intent-chosen-iphone-393x852.png
- eval-results/layout/intent-chosen-iphone-375x667.png
- eval-results/layout/intent-chosen-ipad-portrait-820x1180.png
- eval-results/layout/intent-chosen-ipad-landscape-1180x820.png
- eval-results/layout/builder-slot-filled-iphone-393x852.png
- eval-results/layout/builder-slot-filled-iphone-375x667.png
- eval-results/layout/builder-slot-filled-ipad-portrait-820x1180.png
- eval-results/layout/builder-slot-filled-ipad-landscape-1180x820.png
- eval-results/layout/overstimulated-iphone-393x852.png
- eval-results/layout/overstimulated-iphone-375x667.png
- eval-results/layout/overstimulated-ipad-portrait-820x1180.png
- eval-results/layout/overstimulated-ipad-landscape-1180x820.png
- eval-results/layout/help-panel-iphone-393x852.png
- eval-results/layout/help-panel-iphone-375x667.png
- eval-results/layout/help-panel-ipad-portrait-820x1180.png
- eval-results/layout/help-panel-ipad-landscape-1180x820.png
- eval-results/layout/incoming-message-iphone-393x852.png
- eval-results/layout/incoming-message-iphone-375x667.png
- eval-results/layout/incoming-message-ipad-portrait-820x1180.png
- eval-results/layout/incoming-message-ipad-landscape-1180x820.png
