// Regenerates every raster app-asset from the SVG masters in src/assets/brand/.
// Run: node scripts/generate-brand-assets.mjs
import { writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = join(root, 'src', 'assets', 'brand');
const outDir = join(root, 'assets');

const PRIMARY = '#2f6bed';

const logoSvg = readFileSync(join(brandDir, 'logo-symbol.svg'));

// Favicon 32×32 — no pulse (spec: below 32px the pulse is dropped)
const faviconSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="${PRIMARY}"/>
    <path d="M34 26 H56 C72 26, 82 38, 82 50 C82 62, 72 74, 56 74 H34 Z" fill="none" stroke="#ffffff" stroke-width="10" stroke-linejoin="round"/>
  </svg>`,
);

// Android adaptive foreground: symbol centered in a 66% safe zone on transparent.
// Following Android spec: 108dp canvas, 72dp mask, ~66dp safe zone.
const adaptiveFgSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432">
    <g transform="translate(108 108)">
      <path d="M72 58 H120 C154 58, 174 82, 174 110 C174 138, 154 162, 120 162 H72 Z"
            fill="none" stroke="#ffffff" stroke-width="18" stroke-linejoin="round"/>
      <path d="M48 110 H74 L82 88 L100 132 L108 110 H150"
            fill="none" stroke="#d7f2e6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`,
);

// Android adaptive background: solid primary
const adaptiveBgSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432">
    <rect width="432" height="432" fill="${PRIMARY}"/>
  </svg>`,
);

// Android adaptive monochrome: same silhouette in black (system tints it)
const adaptiveMonoSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432">
    <g transform="translate(108 108)">
      <path d="M72 58 H120 C154 58, 174 82, 174 110 C174 138, 154 162, 120 162 H72 Z"
            fill="none" stroke="#000000" stroke-width="18" stroke-linejoin="round"/>
      <path d="M48 110 H74 L82 88 L100 132 L108 110 H150"
            fill="none" stroke="#000000" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`,
);

// Splash icon: symbol on transparent, will center over primary background per app.json
const splashSvg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <g transform="translate(90 90)">
      <path d="M72 58 H120 C154 58, 174 82, 174 110 C174 138, 154 162, 120 162 H72 Z"
            fill="none" stroke="#ffffff" stroke-width="18" stroke-linejoin="round"/>
      <path d="M48 110 H74 L82 88 L100 132 L108 110 H150"
            fill="none" stroke="#d7f2e6" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`,
);

async function render(svg, size, filename) {
  const buf = await sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
  writeFileSync(join(outDir, filename), buf);
  console.log(`  ✓ ${filename.padEnd(32)} ${size}×${size}`);
}

console.log('Generating brand assets…');
await render(logoSvg, 1024, 'icon.png');
await render(faviconSvg, 64, 'favicon.png');
await render(adaptiveFgSvg, 1024, 'android-icon-foreground.png');
await render(adaptiveBgSvg, 1024, 'android-icon-background.png');
await render(adaptiveMonoSvg, 1024, 'android-icon-monochrome.png');
await render(splashSvg, 1024, 'splash-icon.png');
console.log('Done.');
