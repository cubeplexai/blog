import { readdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const imageDirectory = resolve('static/img/blog');
const replaceSources = process.argv.includes('--replace');
const sourceFiles = (await readdir(imageDirectory)).filter((file) => file.endsWith('.png'));

if (sourceFiles.length === 0) {
  console.log('No PNG blog images found to optimize.');
  process.exit(0);
}

for (const sourceFile of sourceFiles) {
  const sourcePath = resolve(imageDirectory, sourceFile);
  const outputPath = sourcePath.replace(/\.png$/, '.webp');

  await sharp(sourcePath)
    .resize({ width: 1280, height: 640, fit: 'cover', position: 'attention' })
    .webp({ quality: 82, effort: 6 })
    .toFile(outputPath);

  if (replaceSources) await rm(sourcePath);
  console.log(`${sourceFile} -> ${outputPath.split('/').at(-1)}`);
}
