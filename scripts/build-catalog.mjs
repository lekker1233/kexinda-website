// Reads the raw product photos, applies catalog-rules.mjs and writes:
//   public/images/products/*.webp   web-sized images (400 / 800 / 1400 px wide)
//   src/data/products.json          the catalogue used by every page
//   catalog-report.md               what was left out, and why
// Already-converted images are skipped, so re-runs are quick.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { SEASONS, EXCLUDED_NOTES, MANUAL_EXCLUDE, MIN_LONG_SIDE, typeFor } from './catalog-rules.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, '..');
const sourceRoot = path.resolve(site, '..');
const outImages = path.join(site, 'public/images/products');
const outData = path.join(site, 'src/data/products.json');
const cacheDir = path.join(here, '.image-cache');
const WIDTHS = [400, 800, 1400];
const CONCURRENCY = 4;

sharp.cache(false);
fs.mkdirSync(outImages, { recursive: true });
fs.mkdirSync(path.dirname(outData), { recursive: true });
fs.mkdirSync(cacheDir, { recursive: true });

function parseName(file) {
  const raw = file.replace(/\.(jpe?g|png)$/i, '');
  const lit = raw.includes('亮灯');
  const clean = raw
    .replace(/[（(][^）)]*[）)]?/g, (m) => (/^[（(]\d[）)]$/.test(m) ? `-${m.replace(/\D/g, '')}` : ''))
    .replace(/客供瓶）?|亮灯版|不可推\)?/g, '')
    .replace(/\.j$/i, '')
    .replace(/\.+$/g, '')
    .replace(/\s+/g, '');
  const head = clean.match(/^CS26-([A-Z]+\d+)(.*)$/);
  if (!head) return null;
  let code = head[1];
  let rest = head[2];
  const sub = rest.match(/^-(\d+)-(?=[\d.]+(?:寸|尺))/);
  if (sub) {
    code += `-${sub[1]}`;
    rest = rest.slice(sub[0].length - 1);
  }
  const size = rest.match(/^-([\d.]+)(寸|尺)?(.*)$/);
  const value = size ? parseFloat(size[1]) : null;
  const unit = size ? (size[2] === '尺' ? 'ft' : 'in') : null;
  const tail = size ? size[3].replace(/^-/, '') : rest.replace(/^-/, '');
  return { code, value, unit, lit, option: /^\d$/.test(tail) ? +tail : 0 };
}

function sizeInfo(value, unit) {
  if (value == null) return null;
  if (unit === 'ft') {
    const m = value * 0.3048;
    return { value, unit, inches: value * 12, label: `${value} ft`, metric: `${m.toFixed(1)} m` };
  }
  return { value, unit, inches: value, label: `${value} in`, metric: `${Math.round(value * 2.54)} cm` };
}

function hex(n) {
  return Math.round(n).toString(16).padStart(2, '0');
}

async function convert(srcPath, baseName) {
  const metaFile = path.join(cacheDir, `${baseName}.json`);
  if (fs.existsSync(metaFile) && WIDTHS.every((w) => fs.existsSync(path.join(outImages, `${baseName}-${w}.webp`)))) {
    return JSON.parse(fs.readFileSync(metaFile, 'utf8'));
  }
  const open = () => sharp(srcPath, { limitInputPixels: false }).rotate();
  // Downscale once, then derive the smaller sizes from that master.
  const master = await open().resize({ width: 1400, withoutEnlargement: true }).flatten({ background: '#ffffff' }).png({ compressionLevel: 1 }).toBuffer();
  const { width, height } = await sharp(master).metadata();
  for (const w of WIDTHS) {
    await sharp(master)
      .resize({ width: Math.min(w, width) })
      .webp({ quality: w === 1400 ? 78 : 74, effort: 4 })
      .toFile(path.join(outImages, `${baseName}-${w}.webp`));
  }
  // Average of the top corners: fills the frame around non-portrait photos.
  const band = Math.max(4, Math.round(height * 0.04));
  const left = await sharp(master).extract({ left: 0, top: 0, width: Math.round(width * 0.08), height: band }).stats();
  const right = await sharp(master).extract({ left: width - Math.round(width * 0.08), top: 0, width: Math.round(width * 0.08), height: band }).stats();
  const bg = '#' + [0, 1, 2].map((i) => hex((left.channels[i].mean + right.channels[i].mean) / 2)).join('');
  const meta = { src: baseName, w: width, h: height, bg };
  fs.writeFileSync(metaFile, JSON.stringify(meta));
  return meta;
}

const report = [];
const groups = new Map();

for (const { key: season, folder } of SEASONS) {
  const dir = path.join(sourceRoot, folder);
  for (const file of fs.readdirSync(dir).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    const note = EXCLUDED_NOTES.find((n) => file.includes(n.match));
    if (note) { report.push({ season, file, reason: note.reason }); continue; }
    if (file.includes('副本')) { report.push({ season, file, reason: '重复文件（副本）' }); continue; }
    const parsed = parseName(file);
    if (!parsed) { report.push({ season, file, reason: '文件名无法识别' }); continue; }
    const manual = MANUAL_EXCLUDE[`${season}:${parsed.code}`];
    if (manual) { report.push({ season, file, reason: manual }); continue; }
    const fullPath = path.join(dir, file);
    const m = await sharp(fullPath, { limitInputPixels: false }).metadata();
    if (Math.max(m.width, m.height) < MIN_LONG_SIDE) {
      report.push({ season, file, reason: `图片分辨率太低（${m.width}×${m.height}）` });
      continue;
    }
    const key = `${season}|${parsed.code}|${parsed.value ?? ''}${parsed.unit ?? ''}`;
    if (!groups.has(key)) groups.set(key, { season, ...parsed, files: [] });
    const group = groups.get(key);
    group.files.push({ file, fullPath, lit: parsed.lit, option: parsed.option });
    group.lit = group.lit || parsed.lit;
  }
}

const entries = [...groups.values()];
const products = new Array(entries.length);
let done = 0;
let cursor = 0;

async function worker() {
  while (cursor < entries.length) {
    const index = cursor++;
    const g = entries[index];
    const size = sizeInfo(g.value, g.unit);
    const sizeSlug = size ? `-${String(g.value).replace('.', '-')}${g.unit}` : '';
    const slug = `${g.season}-${g.code.toLowerCase()}${sizeSlug}`;
    g.files.sort((a, b) => a.lit - b.lit || a.option - b.option);
    const images = [];
    for (let i = 0; i < g.files.length; i++) {
      const meta = await convert(g.files[i].fullPath, `${slug}${i ? `-${i + 1}` : ''}`);
      images.push({ ...meta, lit: g.files[i].lit });
    }
    products[index] = {
      slug,
      model: `CS26-${g.code}`,
      code: g.code,
      season: g.season,
      type: typeFor(g.season, g.code.split('-')[0], g.value, g.unit),
      size,
      lit: !!g.lit,
      colorOptions: g.files.some((f) => f.option > 0),
      images,
    };
    done++;
    if (done % 25 === 0 || done === entries.length) console.log(`${done}/${entries.length}`);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
fs.writeFileSync(outData, JSON.stringify(products));

const lines = [
  '# 产品目录报告',
  '',
  `网站共收录 **${products.length}** 款产品。以下 **${report.length}** 张图片没有放到公开网站上。`,
  '要调整规则，请修改 `scripts/catalog-rules.mjs`，再运行 `npm run catalog`。',
  '',
  '| 系列 | 文件 | 原因 |',
  '| --- | --- | --- |',
  ...report.map((r) => `| ${r.season} | ${r.file} | ${r.reason} |`),
  '',
];
fs.writeFileSync(path.join(site, 'catalog-report.md'), lines.join('\n'));

const tally = {};
for (const p of products) {
  tally[p.season] ??= { total: 0 };
  tally[p.season].total++;
  tally[p.season][p.type] = (tally[p.season][p.type] ?? 0) + 1;
}
console.log(JSON.stringify(tally, null, 1));
console.log(`products: ${products.length}, excluded files: ${report.length}`);
