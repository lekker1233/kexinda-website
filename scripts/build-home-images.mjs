// Cuts close-up crops from high-resolution wreath photos for the home page
// and collection headers. Crop boxes are fractions of the rotated photo.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const out = path.resolve(here, '../public/images/seasons');
fs.mkdirSync(out, { recursive: true });

const CROPS = [
  { key: 'spring', file: '春天02/春天02/CS26-C295-20寸.jpg', x: [0.15, 0.42], y: [0.33, 0.7] },
  { key: 'easter', file: '复活节/复活节/CS26-F69-22寸.jpg', x: [0.13, 0.38], y: [0.25, 0.6] },
  { key: 'patriotic', file: '国庆/国庆/CS26-G03-24寸.jpg', x: [0.12, 0.38], y: [0.17, 0.53] },
  { key: 'harvest', file: '秋收/秋收/CS26-H88-24寸.jpg', x: [0.08, 0.38], y: [0.3, 0.7] },
  { key: 'halloween', file: '鬼节/鬼节/CS26-G23-24寸.jpg', x: [0.11, 0.36], y: [0.28, 0.68] },
  { key: 'christmas', file: '圣诞/圣诞/CS26-S32-26寸.jpg', x: [0.15, 0.42], y: [0.33, 0.72] },
];

for (const c of CROPS) {
  const buffer = await sharp(path.join(root, c.file), { limitInputPixels: false }).rotate().toBuffer();
  const { width, height } = await sharp(buffer).metadata();
  const left = Math.round(c.x[0] * width);
  const top = Math.round(c.y[0] * height);
  const box = { left, top, width: Math.round((c.x[1] - c.x[0]) * width), height: Math.round((c.y[1] - c.y[0]) * height) };
  await sharp(buffer).extract(box).resize({ width: 900, withoutEnlargement: true }).webp({ quality: 80 }).toFile(path.join(out, `${c.key}.webp`));
  console.log(c.key, `${box.width}x${box.height}`);
}
