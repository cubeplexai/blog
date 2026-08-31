import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const coverWidth = 1280;
const coverHeight = 512;
const input = process.argv[2];
const output = process.argv[3];
const titleFlagIndex = process.argv.indexOf('--title');
const subtitleFlagIndex = process.argv.indexOf('--subtitle');
const logosFlagIndex = process.argv.indexOf('--logos');
const title = titleFlagIndex === -1
  ? 'Agents need their\nown persistent\nworkspace'
  : process.argv[titleFlagIndex + 1];
const subtitle = subtitleFlagIndex === -1 ? '' : process.argv[subtitleFlagIndex + 1];
const logoPaths = logosFlagIndex === -1 ? [] : process.argv.slice(logosFlagIndex + 1, logosFlagIndex + 3);

if (!input || !output || (titleFlagIndex !== -1 && !title) || (subtitleFlagIndex !== -1 && !subtitle) || (logosFlagIndex !== -1 && logoPaths.length !== 2)) {
  throw new Error('Usage: node scripts/create-blog-cover.mjs <input-image> <output-image> [--title "Line one\\nLine two"] [--subtitle "Optional subtitle"] [--logos <first-logo.svg> <second-logo.svg>]');
}

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

const titleLines = title
  .split(/\r?\n/)
  .filter(Boolean)
  .slice(0, 3)
  .map(escapeXml);
const titleMarkup = titleLines
  .map((line, index) => `<tspan x="64" dy="${index === 0 ? 0 : 64}">${line}</tspan>`)
  .join('');

const logo = await readFile(resolve('static/img/cubeplex-lockup-on-light.svg'));
const encodedLogo = logo.toString('base64');
const projectLogos = await Promise.all(logoPaths.map(async (logoPath) => (await readFile(resolve(logoPath))).toString('base64')));
const subtitleMarkup = subtitle
  ? `<text x="64" y="372" fill="#4b5563" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="500">${escapeXml(subtitle)}</text>`
  : '';
const projectLogoMarkup = projectLogos.length === 2
  ? `
    <g transform="translate(64 356)">
      <rect width="48" height="48" rx="12" fill="#fcfcfa" stroke="#e6ebf2" stroke-width="2"/>
      <image href="data:image/svg+xml;base64,${projectLogos[0]}" x="8" y="8" width="32" height="32" preserveAspectRatio="xMidYMid meet"/>
      <path d="M58 24H74" stroke="#1463e9" stroke-width="2" stroke-linecap="round"/>
      <rect x="84" width="48" height="48" rx="12" fill="#fcfcfa" stroke="#e6ebf2" stroke-width="2"/>
      <image href="data:image/svg+xml;base64,${projectLogos[1]}" x="92" y="8" width="32" height="32" preserveAspectRatio="xMidYMid meet"/>
    </g>`
  : '';
const overlay = Buffer.from(`
  <svg width="${coverWidth}" height="${coverHeight}" viewBox="0 0 ${coverWidth} ${coverHeight}" xmlns="http://www.w3.org/2000/svg">
    <image href="data:image/svg+xml;base64,${encodedLogo}" x="64" y="68" width="176" height="40"/>
    <rect x="64" y="140" width="52" height="6" rx="3" fill="#1463e9"/>
    <text x="64" y="214" fill="#17191c" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="700" letter-spacing="-2.3">
      ${titleMarkup}
    </text>
    ${subtitleMarkup}
    ${projectLogoMarkup}
    <path d="M64 438H114" stroke="#1463e9" stroke-width="3" stroke-linecap="round"/>
  </svg>
`);

await sharp(resolve(input))
  .resize({ width: coverWidth, height: coverHeight, fit: 'cover', position: 'attention' })
  .composite([{ input: overlay }])
  .webp({ quality: 84, effort: 6 })
  .toFile(resolve(output));

console.log(`Created ${output}`);
