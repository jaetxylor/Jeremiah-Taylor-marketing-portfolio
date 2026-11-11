// Reuse Jae's existing head and hat at browser-icon sizes.
// The committed icons are served directly; Sharp is only needed to regenerate them.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { mascotHead } from './mascot.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const modulePaths = [root, process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES].filter(Boolean);
const sharp = require(require.resolve('sharp', { paths: modulePaths }));
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="48 2 150 150"><title>Jae’s cartoon headshot</title>${mascotHead}</svg>\n`;
const artwork = Buffer.from(svg);

await fs.writeFile(path.join(root, 'assets/favicon.svg'), svg);
await sharp(artwork).resize(32, 32).png().toFile(path.join(root, 'assets/favicon-32.png'));
await sharp(artwork).resize(144, 144)
  .extend({top:18, bottom:18, left:18, right:18, background:'#242424'})
  .flatten({background:'#242424'}).png()
  .toFile(path.join(root, 'assets/apple-touch-icon.png'));
console.log('Rendered the SVG favicon, 32px fallback and 180px Apple touch icon.');
