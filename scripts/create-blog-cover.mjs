import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const input = process.argv[2];
const output = process.argv[3];
const titleFlagIndex = process.argv.indexOf('--title');
const subtitleFlagIndex = process.argv.indexOf('--subtitle');
const logosFlagIndex = process.argv.indexOf('--logos');
const presetFlagIndex = process.argv.indexOf('--preset');
const highlightLinesFlagIndex = process.argv.indexOf('--highlight-lines');
const highlightWidthsFlagIndex = process.argv.indexOf('--highlight-widths');
const titleSizeFlagIndex = process.argv.indexOf('--title-size');
const lineHeightFlagIndex = process.argv.indexOf('--line-height');
const preset = presetFlagIndex === -1 ? 'wide' : process.argv[presetFlagIndex + 1];
const presets = {
  wide: { width: 1280, height: 512, x: 64, logoY: 68, logoWidth: 176, logoHeight: 40, barY: 140, titleY: 214, titleSize: 58, lineHeight: 64, subtitleY: 372, footerY: 438 },
  share: { width: 1356, height: 1056, x: 80, logoY: 86, logoWidth: 220, logoHeight: 50, barY: 184, titleY: 290, titleSize: 72, lineHeight: 88, subtitleY: 680, footerY: 904 },
};
const cover = presets[preset];
const titleSize = titleSizeFlagIndex === -1 ? cover?.titleSize : Number.parseInt(process.argv[titleSizeFlagIndex + 1], 10);
const lineHeight = lineHeightFlagIndex === -1 ? cover?.lineHeight : Number.parseInt(process.argv[lineHeightFlagIndex + 1], 10);
const title = titleFlagIndex === -1
  ? 'Agents need their\nown persistent\nworkspace'
  : process.argv[titleFlagIndex + 1];
const subtitle = subtitleFlagIndex === -1 ? '' : process.argv[subtitleFlagIndex + 1];
const logoPaths = logosFlagIndex === -1 ? [] : process.argv.slice(logosFlagIndex + 1, logosFlagIndex + 3);
const highlightLines = highlightLinesFlagIndex === -1
  ? []
  : process.argv[highlightLinesFlagIndex + 1].split(',').map((value) => Number.parseInt(value, 10)).filter(Number.isInteger);
const highlightWidths = highlightWidthsFlagIndex === -1
  ? []
  : process.argv[highlightWidthsFlagIndex + 1].split(',').map((value) => Number.parseInt(value, 10)).filter(Number.isInteger);

if (!input || !output || !cover || !Number.isFinite(titleSize) || !Number.isFinite(lineHeight) || (titleFlagIndex !== -1 && !title) || (subtitleFlagIndex !== -1 && !subtitle) || (logosFlagIndex !== -1 && logoPaths.length !== 2) || (highlightLines.length !== highlightWidths.length)) {
  throw new Error('Usage: node scripts/create-blog-cover.mjs <input-image> <output-image> [--preset wide|share] [--title "Line one\\nLine two"] [--title-size 56 --line-height 72] [--highlight-lines 2,3 --highlight-widths 360,240] [--subtitle "Optional subtitle"] [--logos <first-logo.svg> <second-logo.svg>]');
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
  .map((line, index) => `<tspan x="${cover.x}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`)
  .join('');
const highlightMarkup = highlightLines.map((line, index) => {
  const top = cover.titleY + ((line - 1) * lineHeight) - (titleSize * 0.76);
  const width = highlightWidths[index];
  return `<path d="M${cover.x - 10} ${top + 5}H${cover.x + width}V${top + titleSize * 0.92}H${cover.x - 4}Z" fill="#FFE24A" opacity="0.78" transform="rotate(-0.7 ${cover.x} ${top})"/>`;
}).join('');

const logo = await readFile(resolve('static/img/cubeplex-lockup-on-light.svg'));
const encodedLogo = logo.toString('base64');
const projectLogos = await Promise.all(logoPaths.map(async (logoPath) => (await readFile(resolve(logoPath))).toString('base64')));
const subtitleMarkup = subtitle
  ? `<text x="${cover.x}" y="${cover.subtitleY}" fill="#4b5563" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="500">${escapeXml(subtitle)}</text>`
  : '';
const projectLogoMarkup = projectLogos.length === 2
  ? `
    <g transform="translate(${cover.x} ${cover.subtitleY - 16})">
      <rect width="48" height="48" rx="12" fill="#fcfcfa" stroke="#e6ebf2" stroke-width="2"/>
      <image href="data:image/svg+xml;base64,${projectLogos[0]}" x="8" y="8" width="32" height="32" preserveAspectRatio="xMidYMid meet"/>
      <path d="M58 24H74" stroke="#1463e9" stroke-width="2" stroke-linecap="round"/>
      <rect x="84" width="48" height="48" rx="12" fill="#fcfcfa" stroke="#e6ebf2" stroke-width="2"/>
      <image href="data:image/svg+xml;base64,${projectLogos[1]}" x="92" y="8" width="32" height="32" preserveAspectRatio="xMidYMid meet"/>
    </g>`
  : '';
const overlay = Buffer.from(`
  <svg width="${cover.width}" height="${cover.height}" viewBox="0 0 ${cover.width} ${cover.height}" xmlns="http://www.w3.org/2000/svg">
    <image href="data:image/svg+xml;base64,${encodedLogo}" x="${cover.x}" y="${cover.logoY}" width="${cover.logoWidth}" height="${cover.logoHeight}"/>
    <rect x="${cover.x}" y="${cover.barY}" width="52" height="6" rx="3" fill="#1463e9"/>
    ${highlightMarkup}
    <text x="${cover.x}" y="${cover.titleY}" fill="#17191c" font-family="Inter, Arial, sans-serif" font-size="${titleSize}" font-weight="700" letter-spacing="-2.3">
      ${titleMarkup}
    </text>
    ${subtitleMarkup}
    ${projectLogoMarkup}
    <path d="M${cover.x} ${cover.footerY}H${cover.x + 50}" stroke="#1463e9" stroke-width="3" stroke-linecap="round"/>
  </svg>
`);

await sharp(resolve(input))
  .resize({ width: cover.width, height: cover.height, fit: 'cover', position: 'attention' })
  .composite([{ input: overlay }])
  .webp({ quality: 84, effort: 6 })
  .toFile(resolve(output));

console.log(`Created ${output}`);
