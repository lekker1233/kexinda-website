import raw from '../data/products.json';

export type Image = { src: string; w: number; h: number; bg: string; lit: boolean };
export type Size = { value: number; unit: 'in' | 'ft'; inches: number; label: string; metric: string };
export type Product = {
  slug: string;
  model: string;
  code: string;
  season: string;
  type: string;
  size: Size | null;
  lit: boolean;
  colorOptions: boolean;
  images: Image[];
};

export const products = raw as Product[];

// Retail-year order. `color` is sampled from each line's own products.
export const SEASONS = [
  {
    key: 'spring',
    name: 'Spring',
    color: '#b92a63',
    soft: '#f6dfe7',
    blurb: 'Hydrangea, peony, tulip and wildflower wreaths, hand-tied bouquets, potted greenery and single stems in fresh, saturated color.',
  },
  {
    key: 'easter',
    name: 'Easter',
    color: '#5f7d3f',
    soft: '#e6eed6',
    blurb: 'Egg and tulip wreaths, moss bunnies, baskets and garlands in soft pastels and garden greens.',
  },
  {
    key: 'patriotic',
    name: 'Patriotic',
    color: '#1d3a80',
    soft: '#dfe5f3',
    blurb: 'Red, white and blue wreaths, basket arrangements and flag accents for national holidays and summer displays.',
  },
  {
    key: 'harvest',
    name: 'Harvest',
    color: '#b84e0c',
    soft: '#f6e4d3',
    blurb: 'Sunflower, maple and pumpkin wreaths, long garlands, leaf stems and table arrangements in autumn tones.',
  },
  {
    key: 'halloween',
    name: 'Halloween',
    color: '#17131d',
    soft: '#e2dfe6',
    blurb: 'Black rose wreaths, skull and eyeball accents, gothic garlands, topiaries and ghost vases, from elegant to playful.',
  },
  {
    key: 'christmas',
    name: 'Christmas',
    color: '#8a1b24',
    soft: '#f2dedd',
    blurb: 'Pine and berry wreaths, picks and sprays, tabletop trees and pre-lit reindeer centerpieces.',
  },
] as const;

export const TYPES = [
  { key: 'wreath', name: 'Wreaths', one: 'Wreath', note: 'Ring, hoop and shaped wall pieces', image: 'harvest-h35-26in' },
  { key: 'garland', name: 'Garlands & Swags', one: 'Garland', note: 'Greenery garlands, teardrops and door swags', image: 'christmas-s135-6ft' },
  { key: 'stem', name: 'Foliage Stems & Picks', one: 'Stem', note: 'Leaf branches, sprays, berries and single stems', image: 'christmas-s12-22in' },
  { key: 'arrangement', name: 'Arrangements', one: 'Arrangement', note: 'Vase, pot, basket and centerpiece designs', image: 'spring-c399-25in' },
  { key: 'bouquet', name: 'Bouquets', one: 'Bouquet', note: 'Hand-tied bundles, ready for a vase', image: 'spring-c309-20in' },
  { key: 'tree', name: 'Trees, Topiaries & Potted Greenery', one: 'Tree', note: 'Tabletop trees, topiary forms and potted plants', image: 'christmas-s70-34in' },
  { key: 'decor', name: 'Seasonal Décor', one: 'Decorative Piece', note: 'Pumpkins, bunnies, tombstones and accents', image: 'harvest-h42-12in' },
] as const;

export const SIZE_BANDS = [
  { key: 'xs', name: 'Under 12 in', test: (i: number) => i < 12 },
  { key: 's', name: '12 – 17 in', test: (i: number) => i >= 12 && i < 18 },
  { key: 'm', name: '18 – 23 in', test: (i: number) => i >= 18 && i < 24 },
  { key: 'l', name: '24 – 36 in', test: (i: number) => i >= 24 && i <= 36 },
  { key: 'xl', name: 'Over 36 in', test: (i: number) => i > 36 },
] as const;

export const season = (key: string) => SEASONS.find((s) => s.key === key)!;
export const type = (key: string) => TYPES.find((t) => t.key === key)!;
export const bySlug = (slug: string) => {
  const found = products.find((p) => p.slug === slug);
  if (!found) throw new Error(`Unknown product: ${slug}`);
  return found;
};
export const sizeBand = (p: Product) => (p.size ? SIZE_BANDS.find((b) => b.test(p.size!.inches))?.key ?? '' : '');
export const inSeason = (key: string) => products.filter((p) => p.season === key);
export const ofType = (key: string) => products.filter((p) => p.type === key);
// "Tree" reads wrongly for a potted cactus or a moss bunny, so it varies by collection.
const TREE_NAME: Record<string, string> = { spring: 'Potted Greenery', easter: 'Topiary', halloween: 'Topiary', christmas: 'Tree' };
export const oneOf = (p: Product) => (p.type === 'tree' ? TREE_NAME[p.season] ?? 'Tree' : type(p.type).one);
export const titleOf = (p: Product) => `${season(p.season).name} ${oneOf(p)}`;
export const productUrl = (p: Product) => `/products/${p.slug}/`;
export const img = (src: string, w: 400 | 800 | 1400) => `/images/products/${src}-${w}.webp`;
export const srcset = (i: Image) => [400, 800, 1400].filter((w) => w <= 800 || i.w >= 1400).map((w) => `${img(i.src, w as 400)} ${Math.min(w, i.w)}w`).join(', ');
export const altOf = (p: Product) => `Artificial ${titleOf(p).toLowerCase()}, model ${p.model}${p.size ? `, ${p.size.label}` : ''}`;
// Portrait 3:4 photos fill the frame. Others are shown whole on a matching ground.
export const fitOf = (i: Image) => (Math.abs(i.w / i.h - 0.75) < 0.07 ? 'cover' : 'contain');
