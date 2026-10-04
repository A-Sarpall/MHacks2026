import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const VIEWPORTS = [
  ["iphone-393x852", 393, 852],
  ["iphone-375x667", 375, 667],
  ["ipad-portrait-820x1180", 820, 1180],
  ["ipad-landscape-1180x820", 1180, 820],
];
const argv = process.argv.slice(2);
const flag = (name) => {
  const hit = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
  if (!hit) return null;
  const i = hit.indexOf("=");
  return i === -1 ? true : hit.slice(i + 1);
};
const outDir = "eval-results/layout";
const DEMO = "?demo=cup&source=file&siglip=off";
const EMPTY = "?source=file&siglip=off";
const OUTPUT = "[data-testid=deliver-speech], [data-testid=deliver-text]";
const COMMON = {
  "quick phrases": "[data-testid=quick-phrases]",
  camera: "[data-testid=camera-strip]",
  "output buttons": OUTPUT,
  "capacity badge": "[data-testid=capacity-badge]",
  "view toggle": "[data-testid=view-toggle]",
};
const CAPTURED = {
  ...COMMON,
  "object thumb": "[data-testid=object-thumb]",
  "said line": "[data-testid=spoken-text]",
  intents: "[data-testid=intents]",
  candidates: "[data-testid=candidates]",
};
const BUILDER = {
  ...CAPTURED,
  "chosen intent": "[data-testid=intent][aria-pressed=true]",
  builder: "[data-testid=build]",
  "build strip": "[data-testid=build-strip]",
  "build slot": "[data-testid=build-slot]",
  "build say": "[data-testid=build-say]",
  "build option": "[data-testid=build-option]",
};
const BUILDER_TEXT = ["[data-testid=candidate]", "[data-testid=build-strip]", "[data-testid=build-option]", "[data-testid=quick-phrase]", "[data-testid=spoken-text]"];

class NotReached extends Error {}

const waitCandidates = (page) => page.waitForSelector("[data-testid=candidate]", { timeout: 90_000 });
const waitBuilder = async (page) => {
  await waitCandidates(page);
  await page.waitForSelector("[data-testid=build-option]", { timeout: 20_000 });
};
const waitDetector = (page) =>
  page.waitForFunction(() => !(document.querySelector("[data-testid=track-info]")?.textContent ?? "").includes("Loading"), null, { timeout: 30_000 }).catch(() => null);
const waitModels = (page) =>
  page.waitForFunction(() => ![...document.querySelectorAll("div")].some((el) => el.childElementCount === 0 && el.textContent.trim() === "Loading models..."), null, { timeout: 60_000 }).catch(() => null);
const settle = async (page) => {
  await waitDetector(page);
  await waitModels(page);
  await page.waitForTimeout(800);
};

const STATES = {
  "nothing-captured": {
    url: EMPTY,
    reach: async (page) => {
      await page.waitForSelector("[data-testid=user-main]");
      await page.waitForSelector("[data-testid=quick-phrases]");
    },
    required: { ...COMMON, intents: "[data-testid=intents]" },
    sentences: ["[data-testid=quick-phrase]"],
    absent: ["[data-testid=build]", "[data-testid=spoken-text]", "[data-testid=candidates]"],
  },
  "captured-no-intent": {
    url: DEMO,
    reach: async (page) => {
      await waitCandidates(page);
      await page.click('[data-testid=intent][aria-pressed="true"]');
      await page.waitForSelector('[data-testid=intent][aria-pressed="true"]', { state: "detached" });
      await page.waitForSelector("[data-testid=build]", { state: "detached" });
    },
    required: CAPTURED,
    sentences: ["[data-testid=candidate]", "[data-testid=quick-phrase]", "[data-testid=spoken-text]"],
    absent: ["[data-testid=build]"],
  },
  "intent-chosen": { url: DEMO, reach: waitBuilder, required: BUILDER, sentences: BUILDER_TEXT, minCandidates: 4, legacy: true },
  "builder-slot-filled": {
    url: DEMO,
    reach: async (page) => {
      await waitBuilder(page);
      const slots = await page.locator("[data-testid=build-slot]").count();
      if (slots < 2) throw new NotReached(`frame has ${slots} slot(s); filling the only slot would speak the sentence`);
      const before = await page.locator("[data-testid=build-strip]").innerText();
      await page.locator("[data-testid=build-option]").first().click();
      await page.waitForFunction((b) => document.querySelector("[data-testid=build-strip]")?.innerText !== b, before, { timeout: 10_000 });
    },
    required: BUILDER,
    sentences: BUILDER_TEXT,
    minCandidates: 4,
  },
  overstimulated: {
    url: DEMO,
    reach: async (page) => {
      await waitCandidates(page);
      await page.click("[data-testid=capacity-badge]");
      await page.waitForSelector("[data-testid=overstimulated-status]");
    },
    required: {
      ...COMMON,
      "overstimulated status": "[data-testid=overstimulated-status]",
      "clear status": "[data-testid=clear-status]",
      "badge pressed": "[data-testid=capacity-badge][aria-pressed=true]",
    },
    sentences: ["[data-testid=overstimulated-status]", "[data-testid=quick-phrase]", "[data-testid=spoken-text]"],
    absent: ["[data-testid=intents]", "[data-testid=build]", "[data-testid=candidates]"],
  },
  "help-panel": {
    url: DEMO,
    reach: async (page) => {
      await waitBuilder(page);
      await page.locator("[data-testid=quick-phrase]", { hasText: "I need help" }).click();
      await page.waitForSelector("[data-testid=help-panel]");
    },
    required: { ...BUILDER, "help panel": "[data-testid=help-panel]", "help say button": "[data-testid=help-panel] button" },
    sentences: ["[data-testid=help-panel] .text-xl", "[data-testid=help-panel] button", "[data-testid=help-panel] p", ...BUILDER_TEXT],
    minCandidates: 4,
  },
  "incoming-message": {
    url: DEMO,
    setup: async (page) => {
      const cors = { "access-control-allow-origin": "*" };
      await page.route("**/messages/status", (r) => r.fulfill({ status: 200, headers: cors, contentType: "application/json", body: JSON.stringify({ mode: "dry-run", contacts: [] }) }));
      const event = JSON.stringify({ id: "m1", contactId: "c1", from: "Mom", text: "Are you ok?", at: Date.now() });
      await page.route("**/messages/stream", (r) => r.fulfill({ status: 200, headers: cors, contentType: "text/event-stream", body: `retry: 600000\ndata: ${event}\n\n` }));
    },
    reach: async (page) => {
      await waitBuilder(page);
      await page.waitForSelector("[data-testid=incoming-card]", { timeout: 20_000 });
    },
    required: { ...BUILDER, "incoming card": "[data-testid=incoming-card]", "incoming text": "[data-testid=incoming-card] p.text-2xl" },
    sentences: ["[data-testid=incoming-card] p.text-2xl", ...BUILDER_TEXT],
    minCandidates: 4,
  },
};

const audit = (cfg) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const visible = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const label = (el) => (el.getAttribute?.("aria-label") || el.textContent || el.getAttribute?.("placeholder") || "").trim().replace(/\s+/g, " ").slice(0, 60);
  const desc = (n) => {
    const el = n.nodeType === 1 ? n : n.parentElement;
    if (!el) return String(n.nodeName);
    const id = el.getAttribute("data-testid");
    const owner = id ? null : el.closest("[data-testid]")?.getAttribute("data-testid");
    return `${el.tagName.toLowerCase()}${id ? `[${id}]` : owner ? ` in [${owner}]` : ""}`;
  };
  const clipBox = (el) => {
    let box = { top: 0, left: 0, right: vw, bottom: vh };
    for (let p = el.parentElement; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (/(auto|scroll|hidden|clip)/.test(cs.overflowY + cs.overflowX)) {
        const pr = p.getBoundingClientRect();
        box = { top: Math.max(box.top, pr.top), left: Math.max(box.left, pr.left), right: Math.min(box.right, pr.right), bottom: Math.min(box.bottom, pr.bottom) };
      }
    }
    return box;
  };
  const fullyIn = (el) => {
    const r = el.getBoundingClientRect();
    const b = clipBox(el);
    return r.width > 0 && r.height > 0 && r.top >= b.top - 1 && r.left >= b.left - 1 && r.bottom <= b.bottom + 1 && r.right <= b.right + 1;
  };
  const round = (r) => ({ top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right) });
  const blocks = Object.entries(cfg.required).map(([name, sel]) => {
    const els = [...document.querySelectorAll(sel)];
    const first = els[0];
    return { name, sel, found: els.length > 0, inView: els.some(fullyIn), rect: first ? round(first.getBoundingClientRect()) : null };
  });
  const absent = (cfg.absent ?? []).map((sel) => ({ sel, present: document.querySelector(sel) !== null }));
  const candidatesVisible = [...document.querySelectorAll("[data-testid=candidate]")].filter(fullyIn).length;
  const all = [...document.querySelectorAll("body *")];
  const scrollers = all
    .filter((el) => {
      const cs = getComputedStyle(el);
      return /(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1) && visible(el);
    })
    .map((el) => ({
      el: desc(el),
      scrollHeight: el.scrollHeight,
      clientHeight: el.clientHeight,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      hides: Object.entries(cfg.required)
        .filter(([, sel]) => [...el.querySelectorAll(sel)].some((x) => !fullyIn(x)))
        .map(([n]) => n),
    }));
  const small = [...document.querySelectorAll("button, a, input, [role=button]")]
    .filter(visible)
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el: desc(el), text: label(el), w: Math.round(r.width), h: Math.round(r.height) };
    })
    .filter((t) => t.w < 44 || t.h < 44);
  const textParents = (root) => {
    const out = new Set();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) if (n.textContent.trim()) out.add(n.parentElement);
    return [...out];
  };
  const seen = new Set();
  const smallText = [];
  for (const sel of cfg.sentences) {
    for (const el of document.querySelectorAll(sel)) {
      if (!visible(el)) continue;
      for (const t of textParents(el)) {
        if (seen.has(t) || !visible(t)) continue;
        seen.add(t);
        const size = parseFloat(getComputedStyle(t).fontSize);
        if (size < 18) smallText.push({ sel, el: desc(t), text: label(t), size: Math.round(size * 100) / 100 });
      }
    }
  }
  const motion = all
    .filter(visible)
    .map((el) => {
      const cs = getComputedStyle(el);
      const props = cs.transitionProperty.split(",").map((s) => s.trim());
      const durs = cs.transitionDuration.split(",").map((s) => parseFloat(s) || 0);
      const affects = props.some((p, i) => (p === "all" || p === "transform" || p === "opacity") && (durs[i] ?? durs[0]) > 0);
      const anim = cs.animationName !== "none";
      return anim || affects ? { el: desc(el), text: label(el), animation: cs.animationName, transition: `${cs.transitionProperty} ${cs.transitionDuration}` } : null;
    })
    .filter(Boolean);
  return {
    innerWidth: vw,
    innerHeight: vh,
    scrollHeight: document.scrollingElement.scrollHeight,
    scrollWidth: document.scrollingElement.scrollWidth,
    blocks,
    absent,
    candidatesVisible,
    scrollers,
    small,
    smallText,
    motion,
  };
};

const startObserver = () => {
  const desc = (n) => {
    const el = n.nodeType === 1 ? n : n.parentElement;
    if (!el) return String(n.nodeName);
    const id = el.getAttribute("data-testid");
    const owner = id ? null : el.closest("[data-testid]")?.getAttribute("data-testid");
    return `${el.tagName.toLowerCase()}${id ? `[${id}]` : owner ? ` in [${owner}]` : ""}`;
  };
  const skip = (n) => {
    const el = n.nodeType === 1 ? n : n.parentElement;
    return !el || el.closest("canvas, video, time, [data-testid*=clock]") !== null;
  };
  const text = (v) => (v == null ? null : String(v).replace(/\s+/g, " ").slice(0, 80));
  window.__layoutMutations = [];
  const obs = new MutationObserver((list) => {
    for (const m of list) {
      if (skip(m.target)) continue;
      const now =
        m.type === "attributes"
          ? m.target.getAttribute(m.attributeName)
          : m.type === "characterData"
            ? m.target.textContent
            : `+${m.addedNodes.length} -${m.removedNodes.length} ${[...m.addedNodes].map(desc).join(" ")}`;
      window.__layoutMutations.push({ type: m.type, target: desc(m.target), attr: m.attributeName, old: text(m.oldValue), now: text(now) });
    }
  });
  obs.observe(document.documentElement, { subtree: true, childList: true, attributes: true, characterData: true, attributeOldValue: true, characterDataOldValue: true });
  window.__layoutObserver = obs;
};

const groupMutations = (list) => {
  const map = new Map();
  for (const m of list) {
    const key = `${m.type}|${m.target}|${m.attr ?? ""}`;
    const g = map.get(key) ?? { ...m, count: 0, first: m.old, last: m.now };
    g.count++;
    g.last = m.now;
    map.set(key, g);
  }
  return [...map.values()].map(({ type, target, attr, count, first, last }) => ({ type, target, attr, count, first, last }));
};

const evaluateChecks = (state, r, mutations) => {
  const checks = {};
  const hidden = r.scrollers.filter((s) => s.hides.length);
  checks.scroll = { pass: r.scrollHeight <= r.innerHeight && r.scrollWidth <= r.innerWidth && hidden.length === 0, detail: `page ${r.scrollWidth}x${r.scrollHeight} in ${r.innerWidth}x${r.innerHeight}` + (r.scrollers.length ? `; scrollers: ${r.scrollers.map((s) => `${s.el} ${s.scrollHeight}/${s.clientHeight}${s.hides.length ? ` hides ${s.hides.join("+")}` : ""}`).join(", ")}` : "") };
  const missing = r.blocks.filter((b) => !b.inView);
  const present = r.absent.filter((a) => a.present);
  const minC = state.minCandidates ?? 0;
  checks.blocks = {
    pass: missing.length === 0 && present.length === 0 && r.candidatesVisible >= minC,
    detail:
      (missing.length ? `not fully in view: ${missing.map((b) => `${b.name}${b.found ? ` (${b.rect.top}-${b.rect.bottom}px)` : " (absent)"}`).join(", ")}` : "all blocks in view") +
      (present.length ? `; should be absent: ${present.map((a) => a.sel).join(", ")}` : "") +
      (minC ? `; candidates fully visible ${r.candidatesVisible}/${minC}` : `; candidates fully visible ${r.candidatesVisible}`),
  };
  checks.targets = { pass: r.small.length === 0, detail: r.small.length ? r.small.map((t) => `${t.el} "${t.text}" ${t.w}x${t.h}`).join("; ") : "all interactive elements >= 44x44" };
  checks.text = { pass: r.smallText.length === 0, detail: r.smallText.length ? r.smallText.map((t) => `${t.el} "${t.text}" ${t.size}px`).join("; ") : "all sentence text >= 18px" };
  checks.motion = { pass: r.motion.length === 0, detail: r.motion.length ? r.motion.map((m) => `${m.el} "${m.text}" anim=${m.animation} transition=${m.transition}`).join("; ") : "no animation or transform/opacity transition" };
  checks.timers = { pass: mutations.length === 0, detail: mutations.length ? mutations.map((m) => `${m.type} ${m.target}${m.attr ? `[${m.attr}]` : ""} x${m.count}: ${m.first ?? ""} -> ${m.last ?? ""}`).join("; ") : "no DOM changes in 6 s" };
  return checks;
};

const CHECKS = ["scroll", "blocks", "targets", "text", "motion", "timers"];

const observeWindow = async (page) => {
  try {
    await page.evaluate(startObserver);
    await page.waitForTimeout(6000);
    return await page.evaluate(() => {
      if (!window.__layoutObserver) return null;
      window.__layoutObserver.disconnect();
      return window.__layoutMutations;
    });
  } catch {
    return null;
  }
};

const runOne = async (browser, base, stateName, state, [vpName, width, height]) => {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const shot = `${outDir}/${stateName}-${vpName}.png`;
  let loads = 0;
  const vite = [];
  page.on("load", () => loads++);
  page.on("console", (m) => {
    if (m.text().includes("[vite]")) vite.push(m.text());
  });
  try {
    if (state.setup) await state.setup(page);
    let r;
    let raw = null;
    const reloads = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      await page.goto(`${base}${state.url}`);
      await state.reach(page);
      await settle(page);
      r = await page.evaluate(audit, { required: state.required, sentences: state.sentences, absent: state.absent ?? [] });
      const loadsBefore = loads;
      raw = await observeWindow(page);
      if (raw !== null && loads === loadsBefore) break;
      raw = null;
      reloads.push(`attempt ${attempt}: page reloaded during the 6 s window${vite.length ? ` (${vite.splice(0).join("; ")})` : ""}`);
    }
    const mutations = groupMutations(raw ?? []);
    if (raw === null) mutations.push({ type: "reload", target: "document", attr: null, count: reloads.length, first: null, last: reloads.join(" | ") });
    await page.screenshot({ path: shot });
    if (state.legacy) await page.screenshot({ path: `${outDir}/${vpName}.png` });
    const checks = evaluateChecks(state, r, mutations);
    return { state: stateName, viewport: vpName, reached: true, screenshot: shot, checks, raw: { ...r, mutations, reloads } };
  } catch (e) {
    await page.screenshot({ path: shot }).catch(() => null);
    return { state: stateName, viewport: vpName, reached: false, screenshot: shot, reason: e instanceof NotReached ? e.message : `${e.name}: ${e.message.split("\n")[0]}`, checks: {} };
  } finally {
    await context.close();
  }
};

const main = async () => {
  await mkdir(outDir, { recursive: true });
  const wanted = flag("states");
  const names = typeof wanted === "string" ? wanted.split(",").map((s) => s.trim()).filter(Boolean) : Object.keys(STATES);
  const unknown = names.filter((n) => !STATES[n]);
  if (unknown.length) {
    console.error(`unknown states: ${unknown.join(", ")}; known: ${Object.keys(STATES).join(", ")}`);
    process.exit(2);
  }
  const server = await createServer({ logLevel: "warn", server: { port: 5198, hmr: false, watch: null } });
  await server.listen();
  const base = server.resolvedUrls.local[0];
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const results = [];
  try {
    for (const name of names) {
      const rows = await Promise.all(VIEWPORTS.map((vp) => runOne(browser, base, name, STATES[name], vp)));
      for (const row of rows) {
        results.push(row);
        if (!row.reached) {
          console.log(`NOT REACHED ${row.state} ${row.viewport}: ${row.reason}`);
          continue;
        }
        const failed = CHECKS.filter((c) => !row.checks[c].pass);
        console.log(`${failed.length ? "FAIL" : "PASS"} ${row.state} ${row.viewport}: ${failed.length ? failed.map((c) => `${c}: ${row.checks[c].detail}`).join(" | ") : row.checks.scroll.detail}`);
      }
    }
  } finally {
    await browser.close();
    await server.close();
  }
  const failures = results.filter((r) => !r.reached || CHECKS.some((c) => !r.checks[c].pass));
  const summary = {
    generatedAt: new Date().toISOString(),
    states: names,
    viewports: VIEWPORTS.map(([n, w, h]) => ({ name: n, width: w, height: h })),
    checks: CHECKS,
    passed: results.length - failures.length,
    failed: failures.length,
    results,
  };
  const jsonPath = typeof flag("json") === "string" ? flag("json") : `${outDir}/phase1.json`;
  await writeFile(jsonPath, JSON.stringify(summary, null, 2));
  await writeFile(`${outDir}/phase1-report.md`, report(summary, await runNotes()));
  if (flag("json")) console.log(JSON.stringify({ passed: summary.passed, failed: summary.failed, json: jsonPath }));
  console.log(`${summary.passed} passed, ${summary.failed} failed; report ${outDir}/phase1-report.md, json ${jsonPath}`);
  process.exit(failures.length ? 1 : 0);
};

const runNotes = async () => {
  const prev = await readFile(`${outDir}/phase1-report.md`, "utf8").catch(() => "");
  const m = prev.match(/^## Run notes[\s\S]*?(?=^\| state \|)/m);
  return m ? m[0].trimEnd() : "";
};

const report = (s, notes) => {
  const lines = [`# Layout check phase 1`, ``, `Generated ${s.generatedAt}. ${s.passed} passed, ${s.failed} failed (state x viewport). Checks: ${s.checks.join(", ")}.`, ``];
  if (notes) lines.push(notes, ``);
  lines.push(`| state | viewport | ${s.checks.join(" | ")} |`, `|---|---|${s.checks.map(() => "---").join("|")}|`);
  for (const r of s.results) {
    const cells = r.reached ? s.checks.map((c) => (r.checks[c].pass ? "PASS" : "FAIL")) : s.checks.map(() => "NOT REACHED");
    lines.push(`| ${r.state} | ${r.viewport} | ${cells.join(" | ")} |`);
  }
  lines.push(``, `## Failures`, ``);
  let any = false;
  for (const r of s.results) {
    if (!r.reached) {
      any = true;
      lines.push(`### ${r.state} / ${r.viewport}: not reached`, ``, `- ${r.reason}`, ``);
      continue;
    }
    const failed = s.checks.filter((c) => !r.checks[c].pass);
    if (!failed.length) continue;
    any = true;
    lines.push(`### ${r.state} / ${r.viewport}`, ``, `Screenshot: ${r.screenshot}`, ``);
    for (const c of failed) lines.push(`- **${c}**: ${r.checks[c].detail}`);
    lines.push(``);
  }
  if (!any) lines.push(`None.`, ``);
  lines.push(`## Screenshots`, ``);
  for (const r of s.results) lines.push(`- ${r.screenshot}`);
  lines.push(``);
  return lines.join("\n");
};

await main();
