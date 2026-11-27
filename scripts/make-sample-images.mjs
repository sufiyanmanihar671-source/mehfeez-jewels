// Generates illustrated SAMPLE product images (static/samples/*.webp) used by
// supabase/setup/sample-products.sql. They are drawings, clearly labelled
// "Sample image" — replace them with real photos in Admin > Products.
// Run: node scripts/make-sample-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const W = 900;
const H = 1125;
const out = new URL('../static/samples/', import.meta.url);
mkdirSync(out, { recursive: true });

const r1 = (n) => Math.round(n * 10) / 10;
const rad = (d) => (d * Math.PI) / 180;
/** n points on an ellipse arc (0° = right, 90° = bottom). */
const arc = (cx, cy, rx, ry, a0, a1, n) =>
  Array.from({ length: n }, (_, i) => {
    const a = rad(a0 + ((a1 - a0) * i) / Math.max(1, n - 1));
    return { x: r1(cx + rx * Math.cos(a)), y: r1(cy + ry * Math.sin(a)), t: r1((Math.atan2(ry * Math.cos(a), -rx * Math.sin(a)) * 180) / Math.PI) };
  });
const arcPath = (cx, cy, rx, ry, a0, a1) =>
  arc(cx, cy, rx, ry, a0, a1, 60).map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');

const defs = `
<defs>
  <radialGradient id="bg" cx="50%" cy="38%" r="75%">
    <stop offset="0" stop-color="#9a2443"/><stop offset=".55" stop-color="#650D26"/><stop offset="1" stop-color="#2e0410"/>
  </radialGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fbeab0"/><stop offset=".45" stop-color="#d9a84a"/><stop offset="1" stop-color="#8f5f18"/>
  </linearGradient>
  <linearGradient id="silver" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c9d1da"/><stop offset="1" stop-color="#7d8794"/>
  </linearGradient>
  <radialGradient id="ruby" cx="35%" cy="30%" r="70%">
    <stop offset="0" stop-color="#ff8a9c"/><stop offset=".45" stop-color="#c3123a"/><stop offset="1" stop-color="#55001a"/>
  </radialGradient>
  <radialGradient id="emerald" cx="35%" cy="30%" r="70%">
    <stop offset="0" stop-color="#9cf5c4"/><stop offset=".45" stop-color="#16955a"/><stop offset="1" stop-color="#033b20"/>
  </radialGradient>
  <radialGradient id="pink" cx="35%" cy="30%" r="70%">
    <stop offset="0" stop-color="#ffd3e2"/><stop offset=".5" stop-color="#e7799f"/><stop offset="1" stop-color="#8e2c52"/>
  </radialGradient>
  <radialGradient id="pearl" cx="35%" cy="30%" r="70%">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#f1e8da"/><stop offset="1" stop-color="#b9a98f"/>
  </radialGradient>
  <radialGradient id="polki" cx="40%" cy="35%" r="70%">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#ece6d6"/><stop offset="1" stop-color="#bdb39b"/>
  </radialGradient>
  <radialGradient id="cz" cx="35%" cy="30%" r="70%">
    <stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#e3ebf4"/><stop offset="1" stop-color="#93a2b3"/>
  </radialGradient>
  <radialGradient id="glow" cx="50%" cy="45%" r="50%">
    <stop offset="0" stop-color="#ffffff" stop-opacity=".16"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </radialGradient>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#1a0007" flood-opacity=".55"/>
  </filter>
</defs>`;

const bust = `<path d="M330 0 L330 250 C330 330 250 360 140 400 C60 430 0 470 0 520 L0 ${H} L${W} ${H} L${W} 520 C${W} 470 840 430 760 400 C650 360 570 330 570 250 L570 0 Z" fill="#3d0614" opacity=".55"/>
<path d="M330 250 C330 330 250 360 140 400 C60 430 0 470 0 520 M570 250 C570 330 650 360 760 400 C840 430 ${W} 470 ${W} 520" fill="none" stroke="#b03a5b" stroke-opacity=".25" stroke-width="2"/>`;

const frame = (body, withBust = false) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
${defs}
<rect width="${W}" height="${H}" fill="url(#bg)"/>
${withBust ? bust : ''}
<ellipse cx="450" cy="500" rx="430" ry="430" fill="url(#glow)"/>
<g filter="url(#sh)">${body}</g>
<text x="450" y="${H - 40}" text-anchor="middle" font-family="Georgia, serif" font-size="22" letter-spacing="8" fill="#FFF9F3" fill-opacity=".55">SAMPLE IMAGE</text>
</svg>`;

// ---------- primitives ----------
const gem = (x, y, r, fill, metal = 'gold') =>
  `<circle cx="${x}" cy="${y}" r="${r + r * 0.28}" fill="url(#${metal})"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#${fill})"/><circle cx="${r1(x - r * 0.35)}" cy="${r1(y - r * 0.35)}" r="${r1(r * 0.22)}" fill="#fff" opacity=".7"/>`;
const pearl = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#pearl)"/>`;
const square = (x, y, s, rot, fill = 'polki', metal = 'gold') =>
  `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="${-s / 2 - 5}" y="${-s / 2 - 5}" width="${s + 10}" height="${s + 10}" rx="8" fill="url(#${metal})"/><rect x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}" rx="5" fill="url(#${fill})"/><path d="M${-s / 2} ${-s / 2} L${s / 2} ${s / 2} M${s / 2} ${-s / 2} L${-s / 2} ${s / 2}" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/></g>`;
const drop = (x, y, l, w, fill, metal = 'gold') =>
  `<path d="M${x} ${y - 4} Q${x + w + 5} ${r1(y + l * 0.62)} ${x} ${y + l + 5} Q${x - w - 5} ${r1(y + l * 0.62)} ${x} ${y - 4} Z" fill="url(#${metal})"/><path d="M${x} ${y} Q${x + w} ${r1(y + l * 0.62)} ${x} ${y + l} Q${x - w} ${r1(y + l * 0.62)} ${x} ${y} Z" fill="url(#${fill})"/><ellipse cx="${r1(x - w * 0.3)}" cy="${r1(y + l * 0.45)}" rx="${r1(w * 0.18)}" ry="${r1(l * 0.12)}" fill="#fff" opacity=".55"/>`;
const strand = (x, y, n, r, gap = 2) => Array.from({ length: n }, (_, i) => pearl(x, y + i * (2 * r + gap), r)).join('');
// Straight lines have a zero-width bounding box, so gradient strokes vanish: use a flat metal colour.
const flat = { gold: '#d4a248', silver: '#c3cbd5' };
const chain = (d, w = 5, metal = 'gold') =>
  `<path d="${d}" fill="none" stroke="${/^M[^LC]*L[^LC]*$/.test(d) ? flat[metal] : `url(#${metal})`}" stroke-width="${w}" stroke-linecap="round"/>`;

/** Jhumka: stud + link + dome bell + pearl fringe. */
function jhumka(x, y, s = 1, stone = 'ruby', metal = 'gold') {
  const d = 70 * s;
  const top = y + 60 * s;
  const fringe = Array.from({ length: 9 }, (_, i) => {
    const px = r1(x - d + (2 * d * i) / 8);
    return `<line x1="${px}" y1="${r1(top + 64 * s)}" x2="${px}" y2="${r1(top + 84 * s)}" stroke="${flat[metal]}" stroke-width="2"/>${pearl(px, r1(top + 92 * s), r1(8 * s))}`;
  }).join('');
  return `${gem(x, y, 18 * s, stone, metal)}${chain(`M${x} ${r1(y + 22 * s)} L${x} ${top}`, 4, metal)}
<path d="M${r1(x - d)} ${r1(top + 60 * s)} C${r1(x - d)} ${r1(top - 40 * s)} ${r1(x + d)} ${r1(top - 40 * s)} ${r1(x + d)} ${r1(top + 60 * s)} Z" fill="url(#${metal})"/>
<path d="M${r1(x - d * 0.7)} ${r1(top + 44 * s)} C${r1(x - d * 0.6)} ${r1(top + 6 * s)} ${r1(x + d * 0.6)} ${r1(top + 6 * s)} ${r1(x + d * 0.7)} ${r1(top + 44 * s)}" fill="none" stroke="#7a4d10" stroke-width="2" opacity=".6"/>
<rect x="${r1(x - d - 4)}" y="${r1(top + 56 * s)}" width="${r1(2 * d + 8)}" height="${r1(10 * s)}" rx="4" fill="url(#${metal})"/>
${gem(x, r1(top + 28 * s), 10 * s, stone, metal)}${fringe}`;
}

// ---------- compositions ----------
function bridal() {
  const pts = arc(450, 330, 250, 290, 18, 162, 15);
  let b = chain(arcPath(450, 330, 250, 290, 10, 170), 7);
  pts.forEach((p, i) => {
    if (i === 7) return;
    b += strand(p.x, p.y + 26, 3, 7) + drop(p.x, p.y + 70, 34, 11, i % 2 ? 'emerald' : 'ruby');
  });
  pts.forEach((p, i) => (b += i === 7 ? '' : square(p.x, p.y, 32, p.t - 90)));
  const c = pts[7];
  b += strand(c.x, c.y + 40, 2, 8) + drop(c.x, c.y + 70, 120, 42, 'ruby') + square(c.x, c.y, 60, 45) + gem(c.x, c.y, 13, 'ruby');
  b += jhumka(120, 760, 0.85, 'ruby') + jhumka(780, 760, 0.85, 'ruby');
  return frame(b, true);
}
function bridalEarrings() {
  return frame(jhumka(270, 330, 1.7, 'ruby') + jhumka(630, 330, 1.7, 'ruby') + gem(270, 330, 12, 'polki') + gem(630, 330, 12, 'polki'));
}
function adChoker() {
  let b = chain(arcPath(450, 300, 255, 210, 8, 172), 10, 'silver');
  arc(450, 300, 255, 210, 14, 166, 23).forEach((p, i) => {
    if (i % 2 === 0) b += drop(p.x, p.y + 24, 46, 13, 'emerald', 'silver');
  });
  arc(450, 300, 255, 210, 14, 166, 23).forEach((p) => (b += gem(p.x, p.y, 14, 'cz', 'silver')));
  arc(450, 300, 238, 194, 22, 158, 19).forEach((p) => (b += gem(p.x, p.y - 2, 8, 'cz', 'silver')));
  b += drop(450, 540, 110, 40, 'emerald', 'silver') + gem(450, 528, 22, 'cz', 'silver');
  for (const x of [140, 760]) b += gem(x, 760, 22, 'cz', 'silver') + chain(`M${x} 786 L${x} 820`, 4, 'silver') + drop(x, 822, 90, 30, 'emerald', 'silver') + gem(x, 826, 9, 'cz', 'silver');
  return frame(b, true);
}
function templeJhumka() {
  return frame(jhumka(290, 300, 1.9, 'ruby') + jhumka(610, 300, 1.9, 'emerald'));
}
function bangles() {
  let b = '';
  [0, 1, 2, 3].forEach((k) => {
    const y = 700 - k * 110;
    b += `<ellipse cx="450" cy="${y}" rx="250" ry="78" fill="none" stroke="url(#gold)" stroke-width="30"/>`;
    b += `<ellipse cx="450" cy="${y}" rx="250" ry="78" fill="none" stroke="#7a4d10" stroke-opacity=".35" stroke-width="2"/>`;
    arc(450, y, 250, 78, 15, 165, 11).forEach((p, i) => (b += gem(p.x, p.y, 9, [['emerald', 'ruby'], ['ruby', 'polki'], ['emerald', 'polki'], ['ruby', 'emerald']][k][i % 2])));
  });
  return frame(b);
}
function pendantSet() {
  let b = chain(arcPath(450, 140, 200, 400, 15, 165), 3);
  arc(450, 140, 200, 400, 20, 160, 29).forEach((p) => (b += pearl(p.x, p.y, 5)));
  const cx = 450, cy = 590;
  for (let i = 0; i < 10; i++) {
    const a = rad(i * 36);
    b += pearl(r1(cx + 46 * Math.cos(a)), r1(cy + 46 * Math.sin(a)), 15);
  }
  b += gem(cx, cy, 26, 'pink') + strand(cx, cy + 74, 1, 10) + drop(cx, cy + 92, 70, 24, 'pearl');
  for (const x of [150, 750]) b += gem(x, 760, 16, 'pink') + strand(x, 795, 2, 11) + drop(x, 840, 60, 20, 'pearl');
  return frame(b, true);
}
function longHaar() {
  let b = chain(arcPath(450, 40, 230, 560, 22, 158), 6);
  arc(450, 40, 230, 560, 26, 154, 25).forEach((p, i) => {
    if (i % 2)
      b += `<ellipse cx="${p.x}" cy="${p.y}" rx="11" ry="16" transform="rotate(${p.t - 90} ${p.x} ${p.y})" fill="url(#gold)"/><ellipse cx="${p.x}" cy="${p.y}" rx="7" ry="11" transform="rotate(${p.t - 90} ${p.x} ${p.y})" fill="url(#ruby)"/>`;
    else b += `<circle cx="${p.x}" cy="${p.y}" r="21" fill="url(#gold)"/><circle cx="${p.x}" cy="${p.y}" r="15" fill="none" stroke="#7a4d10" stroke-width="2"/><circle cx="${p.x}" cy="${p.y}" r="5" fill="#8f5f18"/>`;
  });
  const cx = 450, cy = 640;
  for (let i = 0; i < 7; i++) {
    const a = 180 + i * 30;
    b += `<path d="M${cx} ${cy} Q${r1(cx + 70 * Math.cos(rad(a - 14)))} ${r1(cy + 70 * Math.sin(rad(a - 14)))} ${r1(cx + 92 * Math.cos(rad(a)))} ${r1(cy + 92 * Math.sin(rad(a)))} Q${r1(cx + 70 * Math.cos(rad(a + 14)))} ${r1(cy + 70 * Math.sin(rad(a + 14)))} ${cx} ${cy} Z" fill="url(#gold)" stroke="#7a4d10" stroke-width="1.5"/>`;
  }
  b += `<circle cx="${cx}" cy="${cy}" r="58" fill="url(#gold)"/>` + gem(cx, cy, 36, 'ruby') + drop(cx, cy + 66, 90, 30, 'ruby') + strand(cx - 40, cy + 50, 3, 8) + strand(cx + 40, cy + 50, 3, 8);
  b += jhumka(120, 790, 0.7, 'ruby') + jhumka(780, 790, 0.7, 'ruby');
  return frame(b, true);
}

const images = {
  'kundan-bridal-set': bridal(),
  'kundan-bridal-earrings': bridalEarrings(),
  'ad-choker': adChoker(),
  'temple-jhumka': templeJhumka(),
  'victorian-bangles': bangles(),
  'pearl-pendant-set': pendantSet(),
  'heritage-long-haar': longHaar()
};
for (const [name, svg] of Object.entries(images)) {
  await sharp(Buffer.from(svg)).webp({ quality: 82 }).toFile(new URL(`${name}.webp`, out).pathname.replace(/^\/([A-Z]:)/, '$1'));
  console.log('static/samples/' + name + '.webp');
}
