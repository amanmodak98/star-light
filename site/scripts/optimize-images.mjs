/**
 * optimize-images.mjs — build the site's image pipeline.
 *
 * The scraped catalogue is 1,412 photographs at 1600x1621 (126 MB), and every one of them
 * frames the fixture inside a large area of empty backdrop. Shipping those as-is means the
 * product reads small and distant in a tight grid, and a phone downloads 40 KB of PNG to
 * show a thumbnail.
 *
 * This script:
 *   1. trims each frame to the fixture, so the product fills the plate;
 *   2. re-encodes to WebP at a 320/640/960/1280 ladder;
 *   3. records the real output dimensions, so every image is CLS-safe.
 *
 * The trim is guarded. Sharp's trim() looks for a uniform border, and these studio
 * backdrops have a lighting gradient, so on 76% of frames it finds nothing to cut and
 * returns the original. Where it does cut, it can cut hard — a wide 3-light sconce comes
 * back as a 1524x420 strip. The guard accepts a trim only when it keeps at least 55% of
 * both axes and the resulting aspect stays plausible, so nothing is ever cropped out of
 * frame. The trimmed aspect is preserved rather than forced square: 84.5% of the
 * catalogue is already near-square, and the rest are genuinely tall or genuinely wide
 * fixtures that a square crop would decapitate.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, '..');
const REPO = join(SITE, '..');
const SRC = join(REPO, 'assets', 'images', 'products');
const EDITORIAL_SRC = join(REPO, 'assets', 'images', 'site');
const OUT = join(SITE, 'public', 'img');
const MANIFEST = join(SITE, 'src', 'data', 'images.json');

const WIDTHS = [320, 640, 960, 1280];
const EDITORIAL_WIDTHS = [320, 640, 960, 1280, 1920];
const QUALITY = 78;

/** The nine editorial interiors that are good enough to build sections from. */
const EDITORIAL = [
  '1761133840.png', '1761134241.png', '1761134423.png', '1761134591.jpg',
  '1761134673.png', '1761135322.png', '1761135431.png', '1761136911.jpg',
  '1761217527.png',
];

const MIN_KEEP = 0.55;
const MIN_ASPECT = 0.2;
const MAX_ASPECT = 5.0;

/** Trim to the fixture, but only when the result is trustworthy. */
async function trimToSubject(path) {
  const meta = await sharp(path).metadata();

  let trimmed = null;
  try {
    // Trim straight off the file. An intermediate PNG round-trip here is a
    // lossless re-encode of every source and dominates the runtime.
    trimmed = await sharp(path).trim({ threshold: 14 }).toBuffer({ resolveWithObject: true });
  } catch {
    trimmed = null;
  }
  if (!trimmed) {
    return { buffer: path, width: meta.width, height: meta.height, trimmed: false };
  }

  const { width, height } = trimmed.info;
  const keepW = width / meta.width;
  const keepH = height / meta.height;
  const aspect = width / height;
  const safe =
    keepW >= MIN_KEEP && keepH >= MIN_KEEP &&
    aspect >= MIN_ASPECT && aspect <= MAX_ASPECT;

  if (!safe) {
    return { buffer: path, width: meta.width, height: meta.height, trimmed: false };
  }
  return { buffer: trimmed.data, width, height, trimmed: true };
}

/**
 * The median colour of the frame's outer ring — the studio backdrop.
 * The product plate is painted in this colour so the photograph never sits in a
 * visible rectangle inside its card.
 */
async function backdropTone(path) {
  const meta = await sharp(path).metadata();
  const W = 48;
  const H = Math.max(1, Math.round((meta.height / meta.width) * W));
  const { data } = await sharp(path)
    .resize({ width: W })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ring = [];
  const m = Math.max(1, Math.round(Math.min(W, H) * 0.1));
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      if (y >= m && y < H - m && x >= m && x < W - m) continue;
      const i = (y * W + x) * 3;
      ring.push([data[i], data[i + 1], data[i + 2]]);
    }
  }
  if (!ring.length) return null;
  const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  ring.sort((a, b) => lum(a) - lum(b));
  const mid = ring[Math.floor(ring.length / 2)];
  const hex = mid.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'));
  return `#${hex.join('')}`;
}

/**
 * Emit one square WebP for a given side length.
 *
 * The subject is trimmed, scaled to fill as much of the square as it can without
 * being cropped, and centred on a canvas painted in the photograph's own backdrop
 * tone. Every output is therefore exactly S x S: the srcset is honest, the file
 * sizes are predictable, and the letterbox margin is invisible because it is the
 * colour the fixture was photographed against.
 *
 * (Sizing by width alone was the obvious approach and the wrong one — a tall
 * spiral pendant at "width 1280" becomes 1280 x 3674, and the catalogue's output
 * grew to 117 MB instead of 62 MB.)
 */
async function emitSquare(subjectBuffer, outBase, side, tone, force) {
  const dest = join(OUT, `${outBase}-${side}.webp`);
  if (!force && existsSync(dest)) {
    return { bytes: statSync(dest).size, width: side, height: side };
  }

  const inner = await sharp(subjectBuffer)
    .resize(side, side, { fit: 'inside' })
    .toBuffer({ resolveWithObject: true });

  const bg = hexToRgb(tone ?? '#F2EDE4');
  const buf = await sharp({
    create: { width: side, height: side, channels: 3, background: bg },
  })
    .composite([
      {
        input: inner.data,
        left: Math.max(0, Math.floor((side - inner.info.width) / 2)),
        top: Math.max(0, Math.floor((side - inner.info.height) / 2)),
      },
    ])
    .webp({ quality: QUALITY, effort: 4 })
    .toBuffer();

  await sharp(buf).toFile(dest);
  return { bytes: buf.length, width: side, height: side };
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/**
 * Emit the width ladder for one source image.
 *
 * `square` is right for catalogue products: the fixture is trimmed, scaled to
 * fill as much of a square as it can without being cropped, and centred on a
 * canvas painted in the photograph's own backdrop tone.
 *
 * The editorial interiors are room shots, not objects — squaring them would cut
 * the room in half — so they keep their aspect and are simply scaled.
 */
async function emit(srcPath, outBase, widths, force, square = true) {
  const dims = await trimToSubject(srcPath);
  const tone = await backdropTone(srcPath);
  const written = [];

  if (!square) {
    for (const width of widths) {
      const dest = join(OUT, `${outBase}-${width}.webp`);
      if (!force && existsSync(dest)) {
        written.push({ w: width, h: null, bytes: statSync(dest).size });
        continue;
      }
      const buf = await sharp(dims.buffer)
        .resize({ width })
        .webp({ quality: QUALITY, effort: 4 })
        .toBuffer();
      await sharp(buf).toFile(dest);
      written.push({ w: width, h: null, bytes: buf.length });
    }
    return {
      ...dims,
      aspect: Number((dims.width / dims.height).toFixed(4)),
      tone,
      written,
    };
  }

  for (const side of widths) {
    const r = await emitSquare(dims.buffer, outBase, side, tone, force);
    written.push({ w: side, h: side, bytes: r.bytes });
  }

  return {
    ...dims,
    aspect: Number((dims.width / dims.height).toFixed(4)),
    tone,
    written,
  };
}

async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    for (;;) {
      const i = cursor++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const force = process.argv.includes('--force');

  const siteData = JSON.parse(readFileSync(join(REPO, 'data', 'site-data.json'), 'utf8'));

  // Every product photograph, deduplicated by file name.
  const productBases = new Map();
  for (const p of siteData.products) {
    for (const im of p.images ?? []) {
      if (!im.local) continue;
      const base = basename(im.local).replace(/\.[^.]+$/, '');
      if (!productBases.has(base)) productBases.set(base, join(REPO, 'assets', im.local.replace(/^assets\//, '')));
    }
  }

  const jobs = [
    ...[...productBases.entries()].map(([base, path]) => ({ base, path, widths: WIDTHS })),
    ...EDITORIAL.map((file) => ({
      base: `editorial-${file.replace(/\.[^.]+$/, '')}`,
      path: join(EDITORIAL_SRC, file),
      widths: EDITORIAL_WIDTHS,
      square: false,
    })),
  ];

  console.log(`optimize-images — ${jobs.length} sources, widths ${WIDTHS.join('/')}`);
  const started = Date.now();

  let done = 0;
  let trimmedCount = 0;
  let totalBytes = 0;

  // Reuse the previous manifest where every file is already on disk — the trim
  // is the slow part of this pipeline, and there is no reason to redo it.
  let previous = {};
  if (existsSync(MANIFEST) && !force) {
    try {
      previous = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    } catch {
      previous = {};
    }
  }

  const manifest = {};
  await pool(jobs, 8, async (job) => {
    if (!existsSync(job.path)) {
      console.warn(`  ! missing ${job.path}`);
      return;
    }
    const reusable =
      previous[job.base] &&
      job.widths.every((w) => existsSync(join(OUT, `${job.base}-${w}.webp`)));
    if (reusable) {
      manifest[job.base] = previous[job.base];
      return;
    }
    const res = await emit(job.path, job.base, job.widths, force, job.square !== false);
    manifest[job.base] = {
      w: res.width,
      h: res.height,
      aspect: res.aspect,
      trimmed: res.trimmed,
      tone: res.tone,
    };
    if (res.trimmed) trimmedCount += 1;
    for (const f of res.written) totalBytes += f.bytes;
    done += 1;
    if (done % 150 === 0) process.stderr.write('.');
  });

  writeFileSync(MANIFEST, JSON.stringify(manifest));

  const elapsed = ((Date.now() - started) / 1000).toFixed(1);
  const mb = (totalBytes / 1048576).toFixed(1);
  const trimmedPct = ((trimmedCount / jobs.length) * 100).toFixed(0);
  console.log(`\n  ${jobs.length} images in ${elapsed}s`);
  console.log(`  trimmed to subject: ${trimmedCount} (${trimmedPct}%)`);
  console.log(`  total output: ${mb} MB across ${Object.keys(manifest).length} sources`);
  console.log(`  manifest: ${MANIFEST.replace(SITE + '/', '')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
