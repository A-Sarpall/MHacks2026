import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCES = {
  webcam: { width: 640, height: 480, quality: 95, fit: "letterbox" },
  phone: { width: 4032, height: 3024, quality: 50, fit: "inside" },
  "ring-wifi": { width: 640, height: 480, quality: 80, fit: "letterbox" },
  "ring-ble": { width: 320, height: 240, quality: 60, fit: "letterbox" },
};

const IMAGE_RE = /\.(jpe?g|png|webp)$/i;

function parseArgs(argv) {
  let inputDir = null;
  let outPrefix = "test-images-public/dev";
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--out-prefix") outPrefix = argv[++i];
    else if (!inputDir) inputDir = argv[i];
  }
  if (!inputDir) {
    console.error("usage: node scripts/make-source-variants.mjs <inputDir> [--out-prefix test-images-public/dev]");
    process.exit(1);
  }
  return { inputDir, outPrefix };
}

function letterboxGeometry(w, h, W, H) {
  const scale = Math.min(W / w, H / h);
  const sw = Math.max(1, Math.round(w * scale));
  const sh = Math.max(1, Math.round(h * scale));
  return { sw, sh, left: Math.floor((W - sw) / 2), top: Math.floor((H - sh) / 2) };
}

async function convert(src, dst, spec) {
  const img = sharp(src).rotate();
  const meta = await img.metadata();
  const w = meta.width;
  const h = meta.height;
  let pipeline;
  let geo = null;
  if (spec.fit === "letterbox") {
    geo = letterboxGeometry(w, h, spec.width, spec.height);
    const inner = await img.resize(geo.sw, geo.sh, { fit: "fill" }).toBuffer();
    pipeline = sharp({
      create: { width: spec.width, height: spec.height, channels: 3, background: { r: 0, g: 0, b: 0 } },
    }).composite([{ input: inner, left: geo.left, top: geo.top }]);
  } else {
    pipeline = img.resize(spec.width, spec.height, { fit: "inside", withoutEnlargement: false });
  }
  const info = await pipeline.jpeg({ quality: spec.quality }).toFile(dst);
  return { width: info.width, height: info.height, size: info.size, geo, srcW: w, srcH: h };
}

function remapAim(aim, r, spec) {
  if (!Array.isArray(aim) || aim.length !== 2 || !r.geo) return aim;
  const x = (r.geo.left + aim[0] * r.geo.sw) / spec.width;
  const y = (r.geo.top + aim[1] * r.geo.sh) / spec.height;
  return [Number(x.toFixed(4)), Number(y.toFixed(4))];
}

async function main() {
  const { inputDir, outPrefix } = parseArgs(process.argv.slice(2));
  const entries = (await fs.readdir(inputDir)).filter((f) => IMAGE_RE.test(f)).sort();
  const labelsPath = path.join(inputDir, "labels.json");
  const labels = JSON.parse(await fs.readFile(labelsPath, "utf8"));
  const summary = {};
  for (const [name, spec] of Object.entries(SOURCES)) {
    const outDir = `${outPrefix}-${name}`;
    await fs.mkdir(outDir, { recursive: true });
    const outLabels = {};
    let bytes = 0;
    let count = 0;
    for (const file of entries) {
      const r = await convert(path.join(inputDir, file), path.join(outDir, file), spec);
      bytes += r.size;
      count++;
      const entry = labels[file];
      if (entry) {
        outLabels[file] = {
          ...entry,
          aim: remapAim(entry.aim, r, spec),
          tags: Array.from(new Set([...(entry.tags ?? []), name])),
        };
      }
    }
    for (const [file, entry] of Object.entries(labels)) {
      if (!outLabels[file]) outLabels[file] = { ...entry, tags: Array.from(new Set([...(entry.tags ?? []), name])) };
    }
    await fs.writeFile(path.join(outDir, "labels.json"), JSON.stringify(outLabels, null, 2) + "\n");
    summary[name] = { outDir, images: count, meanBytes: count ? Math.round(bytes / count) : 0, spec };
  }
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
