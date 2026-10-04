import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";
import { createServer } from "vite";

const VIEWPORTS = [
  ["iphone-393x852", 393, 852],
  ["iphone-375x667", 375, 667],
  ["ipad-portrait-820x1180", 820, 1180],
  ["ipad-landscape-1180x820", 1180, 820],
];
const REQUIRED = {
  "quick phrases": "[data-testid=quick-phrases]",
  camera: "[data-testid=camera-strip]",
  intents: "[data-testid=intents]",
  builder: "[data-testid=build]",
  "output buttons": "[data-testid=deliver-speech], [data-testid=deliver-text]",
};
const outDir = "eval-results/layout";
await mkdir(outDir, { recursive: true });

const server = await createServer({ logLevel: "warn", server: { port: 5198 } });
await server.listen();
const base = server.resolvedUrls.local[0];
const browser = await chromium.launch({ channel: "chrome", headless: true });
let failed = 0;
try {
  for (const [name, width, height] of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(`${base}?demo=cup&source=file&siglip=off`);
    await page.waitForSelector("[data-testid=candidate]", { timeout: 90_000 });
    await page.waitForTimeout(800);
    const result = await page.evaluate((required) => {
      const inView = (el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0 && r.top >= -1 && r.bottom <= window.innerHeight + 1;
      };
      const missing = Object.entries(required)
        .filter(([, sel]) => ![...document.querySelectorAll(sel)].some(inView))
        .map(([label]) => label);
      const sentences = [...document.querySelectorAll("[data-testid=candidate]")].filter(inView).length;
      const small = [...document.querySelectorAll("main button")]
        .filter((b) => b.offsetParent !== null)
        .map((b) => ({ t: b.textContent.trim().slice(0, 24), h: Math.round(b.getBoundingClientRect().height), w: Math.round(b.getBoundingClientRect().width) }))
        .filter((b) => b.h < 44 || b.w < 44);
      return {
        scrollHeight: document.scrollingElement.scrollHeight,
        innerHeight: window.innerHeight,
        missing,
        sentencesVisible: sentences,
        smallTargets: small,
      };
    }, REQUIRED);
    const ok = result.scrollHeight <= result.innerHeight && result.missing.length === 0 && result.sentencesVisible >= 4 && result.smallTargets.length === 0;
    if (!ok) failed++;
    await page.screenshot({ path: `${outDir}/${name}.png` });
    console.log(
      `${ok ? "PASS" : "FAIL"} ${name}: scroll ${result.scrollHeight}/${result.innerHeight}` +
        `, sentences visible ${result.sentencesVisible}` +
        (result.missing.length ? `, not visible: ${result.missing.join(", ")}` : "") +
        (result.smallTargets.length ? `, small targets: ${result.smallTargets.map((b) => `${b.t}(${b.w}x${b.h})`).join(" ")}` : "")
    );
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}
process.exit(failed ? 1 : 0);
