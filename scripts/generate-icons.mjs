import fs from 'node:fs';
import path from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const root = path.resolve(import.meta.dirname, '..');
const svg = fs.readFileSync(path.join(root, 'dist/icon.svg'), 'utf8');
const foreground = svg.replace(/<rect[^>]+\/>/, '');
const art = svg.replace(/^.*?<svg[^>]*>/s, '').replace(/<\/svg>.*$/s, '');
const res = path.join(root, 'android/app/src/main/res');

function render(source, width, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const png = new Resvg(source, { fitTo: { mode: 'width', value: width } }).render().asPng();
  fs.writeFileSync(file, png);
}

for (const size of [180, 192, 512]) {
  render(svg, size, path.join(root, `dist/icon-${size}.png`));
}

const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [density, scale] of Object.entries(densities)) {
  const dir = path.join(res, `mipmap-${density}`);
  const size = Math.round(48 * scale);
  render(svg, size, path.join(dir, 'ic_launcher.png'));
  render(svg, size, path.join(dir, 'ic_launcher_round.png'));
  render(foreground, Math.round(108 * scale), path.join(dir, 'ic_launcher_foreground.png'));
}

const splashFiles = [];
function collect(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) collect(file);
    else if (entry.name === 'splash.png') splashFiles.push(file);
  }
}
collect(res);
for (const file of splashFiles) {
  const old = fs.readFileSync(file);
  const width = old.readUInt32BE(16);
  const height = old.readUInt32BE(20);
  const iconSize = Math.round(Math.min(width, height) * 0.24);
  const x = (width - iconSize) / 2;
  const y = (height - iconSize) / 2;
  const source = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="#e8e9e6"/><g transform="translate(${x} ${y}) scale(${iconSize / 512})">${art}</g></svg>`;
  render(source, width, file);
}

fs.writeFileSync(path.join(res, 'values/ic_launcher_background.xml'), '<resources><color name="ic_launcher_background">#242c30</color></resources>\n');
console.log(`Generated web icons, Android launcher icons and ${splashFiles.length} splash assets.`);
