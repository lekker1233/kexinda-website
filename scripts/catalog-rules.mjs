// Catalogue rules. Edit this file, then run `npm run catalog` to rebuild.

// Source folders (relative to the project root) -> website collections.
// Ordered by the retail year, which is also the order used on the site.
export const SEASONS = [
  { key: 'spring', folder: '春天02/春天02' },
  { key: 'easter', folder: '复活节/复活节' },
  { key: 'patriotic', folder: '国庆/国庆' },
  { key: 'harvest', folder: '秋收/秋收' },
  { key: 'halloween', folder: '鬼节/鬼节' },
  { key: 'christmas', folder: '圣诞/圣诞' },
];

// Files whose names contain these notes stay off the public site.
export const EXCLUDED_NOTES = [
  { match: '不可推', reason: '文件名标注“不可推”' },
  { match: '客供瓶', reason: '文件名标注“客供瓶”（客户提供的瓶子）' },
];

// Photos below this longest side (px) look blurred on a product page.
export const MIN_LONG_SIDE = 600;

// One-off exclusions, as "season:model".
export const MANUAL_EXCLUDE = {
  'patriotic:G16-1': '照片里有手入镜，需要重拍',
};

// Product type per model. Ranges are inclusive and use the model number.
// Models not listed fall back to: feet => garland, otherwise arrangement.
// "G17@24" targets one size when a code is shared by two different products.
const T = {
  w: 'wreath',
  g: 'garland',
  s: 'stem',
  a: 'arrangement',
  b: 'bouquet',
  t: 'tree',
  d: 'decor',
};

const RULES = {
  spring: {
    w: 'C225-C231 C240-C242 C244-C245 C269-C277 C280-C281 C294-C297 C300 C304 C312-C315 C318-C327 C330-C331 C345-C348 C360 C362 C369 C375 C394',
    g: 'C230',
    s: 'C243 C334-C336 C383-C393',
    b: 'C260-C268 C278-C279 C298 C305-C311 C328-C329 C371 C380',
    t: 'C333 C370 C372-C374 C376-C377 C397',
    d: 'C378-C379',
  },
  easter: {
    w: 'F14 F16-F18 F20 F58 F61-F62 F67-F69 F104 F106 F108-F111 F113',
    g: 'F08 F103 F105 F107',
    s: 'F12',
    t: 'F59-F60',
    d: 'F10-F11 F64',
  },
  patriotic: {
    w: 'G01 G03-G04 G17 G21 G23 G27-G28 G30-G31',
    d: 'G29',
  },
  harvest: {
    w: 'H33 H35 H37 H61-H66 H68-H74 H80-H86 H88 H90-H91 H99-H101 H121-H123 H129-H134 H136 H138 H141 H146 H149 H153 H155 H157 H160 H163 H314-H315 H341 H404-H406',
    g: 'H14 H34 H87 H89 H92 H137 H139 H142 H144 H147 H150 H152 H156 H158 H161 H164 H407-H410',
    s: 'H04-H05 H24-H28 H32 H36 H135 H140 H143 H145 H148 H151 H154 H159 H162 H165',
    d: 'H10-H13 H31 H41-H42',
  },
  halloween: {
    w: 'G09-G13 G17@16 G18 G22-G23 G27-G31 G33-G39 G44-G47 G50-G51 G53 G55 G63 G65 G70-G71 G73-G74 G76 G78 G81 G83-G88 G90 G94 G96-G100 G102 G105 G108-G111 G115-G117 G132 G136 G141 G149 G179 S165',
    g: 'G48-G49 G52 G54 G56-G62 G64 G66 G68-G69 G72 G75 G77 G79-G80 G82 G91-G93 G101 G103-G104 G140 G156-G157 G171',
    s: 'G40-G43 S166',
    t: 'G118 G142 G177 G180-G185',
    d: 'G16 G17@24 G95 G119-G120 G128 G143',
  },
  christmas: {
    w: 'S24 S30-S32 S37 S40-S41 S61-S62 S68 S72 S74 S76-S80 S88 S142-S145 S359 S362-S366 S570-S577 S585-S587 S592-S594',
    g: 'S69 S82 S133-S135 S139-S140 S151 S595',
    s: 'S02-S23 S26-S29 S48-S51 S73 S75 S92 S132 S141 S578-S584 S589-S591',
    t: 'S39 S57-S60 S70-S71 S85-S86 S146 S360-S361 S569 S596',
  },
};

function expand(spec) {
  const out = new Map();
  for (const [letter, list] of Object.entries(spec)) {
    for (const token of list.split(/\s+/)) {
      const range = token.match(/^([A-Z])(\d+)-[A-Z](\d+)$/);
      if (range) {
        for (let n = +range[2]; n <= +range[3]; n++) {
          out.set(range[1] + String(n).padStart(Math.min(range[2].length, 2), '0'), T[letter]);
        }
      } else {
        out.set(token, T[letter]);
      }
    }
  }
  return out;
}

const LOOKUP = Object.fromEntries(Object.entries(RULES).map(([k, v]) => [k, expand(v)]));

export function typeFor(season, code, sizeValue, unit) {
  const table = LOOKUP[season];
  const byGivenSize = table.get(`${code}@${sizeValue}`);
  if (byGivenSize) return byGivenSize;
  if (table.has(code)) return table.get(code);
  return unit === 'ft' ? 'garland' : 'arrangement';
}
