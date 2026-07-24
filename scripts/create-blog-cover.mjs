import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const input = process.argv[2];
const output = process.argv[3];

if (!input || !output) {
  throw new Error('Usage: node scripts/create-blog-cover.mjs <input-image> <output-image>');
}

const logo = await readFile(resolve('static/img/cubeplex-lockup-on-dark.svg'));
const encodedLogo = logo.toString('base64');
const overlay = Buffer.from(`
  <svg width="1280" height="640" viewBox="0 0 1280 640" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="scrim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#05070b" stop-opacity="0.94"/>
        <stop offset="0.48" stop-color="#05070b" stop-opacity="0.58"/>
        <stop offset="0.72" stop-color="#05070b" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <rect width="1280" height="640" fill="url(#scrim)"/>
    <image href="data:image/svg+xml;base64,${encodedLogo}" x="72" y="72" width="176" height="40"/>
    <text x="72" y="260" fill="#f4f4f5" font-family="Inter, Arial, sans-serif" font-size="66" font-weight="700" letter-spacing="-2.6">
      <tspan x="72" dy="0">Agents need their</tspan>
      <tspan x="72" dy="74">own persistent</tspan>
      <tspan x="72" dy="74">workspace</tspan>
    </text>
    <rect x="72" y="532" width="50" height="3" fill="#6a83e3"/>
    <text x="72" y="572" fill="#d4d4d8" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="500">
      CubePlex Blog
    </text>
  </svg>
`);

await sharp(resolve(input))
  .resize({ width: 1280, height: 640, fit: 'cover', position: 'attention' })
  .composite([{ input: overlay }])
  .webp({ quality: 84, effort: 6 })
  .toFile(resolve(output));

console.log(`Created ${output}`);
