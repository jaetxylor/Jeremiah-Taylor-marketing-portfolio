// Pre-render the site's share card from the existing wordmark and mascot.
// The committed JPEG is served directly; Sharp is needed only to regenerate it.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mascotMark } from './mascot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const modulePaths = [root, process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean);
const sharp = require(require.resolve('sharp', { paths: modulePaths }));
const output = path.join(root, 'assets/social/psrmalam-share.jpg');

const backdrop = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#242424"/>
  <path d="M84 76H168" stroke="#70b7ea" stroke-width="4" stroke-linecap="round"/>
  <text x="84" y="408" font-family="DejaVu Sans,Arial,sans-serif" font-size="51" font-weight="500" fill="#f5f2ed">hey, i am Jae.</text>
  <text x="86" y="461" font-family="DejaVu Sans,Arial,sans-serif" font-size="25" fill="#c5c2bd">Projects, past work, hobbies and notes along the way.</text>
  <path d="M84 530H1116" stroke="#4b4b4b" stroke-width="1"/>
  <text x="86" y="574" font-family="DejaVu Sans,Arial,sans-serif" font-size="17" font-weight="600" letter-spacing="2.8" fill="#f5f2ed">PSRMALAM.COM</text>
  <text x="1114" y="574" text-anchor="end" font-family="DejaVu Sans,Arial,sans-serif" font-size="17" fill="#aaa7a3">A little corner of the internet</text>
</svg>`);
const wordmark = await sharp(path.join(root, 'assets/psrmalam-cloud-wordmark.webp'))
  .resize(760, 253, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
const mascot = mascotMark.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')
  .replace('viewBox="5 5 188 143"', 'viewBox="0 0 195 190"')
  .replace('width="56"', 'width="270"').replace('height="43"', 'height="263"');
const mascotRaster = await sharp(Buffer.from(mascot)).png().toBuffer();

await fs.mkdir(path.dirname(output), { recursive: true });
await sharp(backdrop)
  .composite([
    { input: wordmark, left: 69, top: 109 },
    { input: mascotRaster, left: 840, top: 128 },
  ])
  .jpeg({ quality: 92, mozjpeg: true, chromaSubsampling: '4:4:4' })
  .toFile(output);
console.log(JSON.stringify({ output, width: 1200, height: 630, bytes: (await fs.stat(output)).size }));
