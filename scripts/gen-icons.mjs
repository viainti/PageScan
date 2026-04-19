import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const sizes = [16, 32, 48, 128];
const publicDir = join(process.cwd(), "public");

for (const size of sizes) {
  const pad = Math.round(size * 0.12);
  const fontSize = Math.round(size * 0.62);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#0f1f24"/>
  <text
    x="50%"
    y="50%"
    dominant-baseline="central"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="#ffffff"
    letter-spacing="-1"
  >P</text>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();

  const outPath = join(publicDir, `icon${size}.png`);
  writeFileSync(outPath, pngBuffer);
  console.log(`✓ icon${size}.png`);
}

console.log("Icons generated.");
