/**
 * Cuts a subject out of a black-backed photo, writing <name>-fg.png next to it.
 *
 * Used for two assets, both opaque RGB with no alpha:
 *   herobg.png     -> the statue, stacked ABOVE the hero wordmark so the name
 *                     reads as passing behind the figure's head.
 *   contactbg.png  -> the two reaching hands, so they sit on the section's own
 *                     black rather than as a photo rectangle with a visible
 *                     edge and its own grade.
 *   projbg.png     -> the sword-bearer behind the Work section.
 *   skillsbg.png   -> David's profile behind the Skills section.
 *
 * Method: the source is a lit figure on pure black, so luminance separates
 * subject from background almost perfectly. The only hard part is the figure's
 * own shadows, which are as dark as the backdrop. A plain threshold punches
 * holes in them, so instead we flood-fill inward from the border: dark pixels
 * REACHABLE from the edge are background, dark pixels enclosed by the figure
 * are kept. Genuine see-through gaps (between arm and body) stay open because
 * they connect to the border; interior shadow pockets do not.
 *
 * Run: node scripts/build-hero-matte.mjs            (all configured assets)
 *      node scripts/build-hero-matte.mjs contactbg  (one of them)
 */
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ASSETS = {
  // threshold: luminance at or below this counts as "possibly background".
  //   Deliberately low — the flood fill handles enclosed darkness, so this only
  //   needs to catch the true backdrop plus the faintest rim of the subject.
  // close: seals hairline dark channels that would let the fill leak inward
  //   (the carved relief on the statue's plinth is the main offender).
  // feather: softens the matte edge so the cutout composites without aliasing.
  herobg:    { threshold: 9, close: 2, feather: 1.1 },
  // The hands are lit lower and hold more mid-shadow than the statue, so the
  // threshold sits lower still and the close radius is larger to keep the
  // shaded knuckles and finger gaps intact.
  contactbg: { threshold: 7, close: 3, feather: 1.0 },
  // Sword-bearer for the Work section: bright marble, but the blade's engraved
  // gold has dark channels through it that a wide close would bridge shut.
  projbg:    { threshold: 8, close: 2, feather: 1.1 },
  // David's profile for Skills: high-key marble against pure black, the
  // cleanest separation of the four.
  skillsbg:  { threshold: 8, close: 2, feather: 1.1 },
};

const only = process.argv[2];
const names = only ? [only] : Object.keys(ASSETS);
for (const name of names) {
  if (!ASSETS[name]) throw new Error(`unknown asset "${name}" — expected one of ${Object.keys(ASSETS).join(', ')}`);
  await cutout(name, ASSETS[name]);
}

async function cutout(name, { threshold: THRESHOLD, close: CLOSE_RADIUS, feather: FEATHER }) {
const SRC = path.join(ROOT, `public/images/${name}.png`);
const OUT = path.join(ROOT, `public/images/${name}-fg.png`);

const { data: lum, info } = await sharp(SRC)
  .greyscale()
  .raw()
  .toBuffer({ resolveWithObject: true });

const W = info.width;
const H = info.height;
const N = W * H;

// 1 = figure (or not yet proven to be background), 0 = background
const solid = new Uint8Array(N);
for (let i = 0; i < N; i++) solid[i] = lum[i] > THRESHOLD ? 1 : 0;

// --- Morphological close (dilate then erode) to seal thin dark channels ---
const dilateOrErode = (src, radius, mode) => {
  // Separable: horizontal pass then vertical pass.
  const pick = mode === 'dilate' ? 1 : 0;
  const tmp = new Uint8Array(N);
  const dst = new Uint8Array(N);
  for (let y = 0; y < H; y++) {
    const row = y * W;
    for (let x = 0; x < W; x++) {
      let v = mode === 'dilate' ? 0 : 1;
      for (let d = -radius; d <= radius; d++) {
        const xx = x + d;
        if (xx < 0 || xx >= W) continue;
        if (src[row + xx] === pick) { v = pick; break; }
      }
      tmp[row + x] = v;
    }
  }
  for (let x = 0; x < W; x++) {
    for (let y = 0; y < H; y++) {
      let v = mode === 'dilate' ? 0 : 1;
      for (let d = -radius; d <= radius; d++) {
        const yy = y + d;
        if (yy < 0 || yy >= H) continue;
        if (tmp[yy * W + x] === pick) { v = pick; break; }
      }
      dst[y * W + x] = v;
    }
  }
  return dst;
};

let closed = dilateOrErode(solid, CLOSE_RADIUS, 'dilate');
closed = dilateOrErode(closed, CLOSE_RADIUS, 'erode');

// --- Flood fill background inward from the border ---
const isBg = new Uint8Array(N);
const stack = new Int32Array(N);
let sp = 0;
const push = (i) => {
  if (i >= 0 && i < N && !isBg[i] && !closed[i]) { isBg[i] = 1; stack[sp++] = i; }
};
for (let x = 0; x < W; x++) { push(x); push((H - 1) * W + x); }
for (let y = 0; y < H; y++) { push(y * W); push(y * W + W - 1); }

while (sp > 0) {
  const i = stack[--sp];
  const x = i % W;
  if (x > 0) push(i - 1);
  if (x < W - 1) push(i + 1);
  push(i - W);
  push(i + W);
}

// Anything not reached from the border is figure — including its own shadows.
const alpha = Buffer.alloc(N);
for (let i = 0; i < N; i++) alpha[i] = isBg[i] ? 0 : 255;

const coverage = alpha.reduce((n, v) => n + (v ? 1 : 0), 0) / N;
console.log(`${name}: matte coverage ${(coverage * 100).toFixed(1)}% of frame`);

// blur() promotes a raw single-channel buffer to 3-channel sRGB, so force it
// back to b-w before reading it out — otherwise the buffer is 3x the expected
// length, joinChannel reads it at the wrong stride, and the matte comes back
// as diagonal shredding that still looks vaguely image-shaped.
const { data: feathered, info: fInfo } = await sharp(alpha, {
  raw: { width: W, height: H, channels: 1 },
})
  .blur(FEATHER)
  .toColourspace('b-w')
  .raw()
  .toBuffer({ resolveWithObject: true });

if (fInfo.channels !== 1 || feathered.length !== N) {
  throw new Error(`matte must stay single-channel: got ${fInfo.channels}ch / ${feathered.length}B, expected 1ch / ${N}B`);
}

// No ensureAlpha() here: the source is 3-channel, so joinChannel appends the
// matte AS the alpha channel. On an already-RGBA image it would instead add a
// bogus fifth channel and the cutout comes out shredded.
await sharp(SRC)
  .joinChannel(feathered, { raw: { width: W, height: H, channels: 1 } })
  .png({ compressionLevel: 9 })
  .toFile(OUT);

console.log('wrote', path.relative(ROOT, OUT));
}
