import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

if (!fs.existsSync('public')) {
  fs.mkdirSync('public', { recursive: true });
}

function createPng(width, height, isMaskable = false) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth 8
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  function chunk(type, data) {
    const typeBuf = Buffer.from(type);
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    let c = 0xffffffff;
    const buf = Buffer.concat([typeBuf, data]);
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let k = 0; k < 8; k++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE((c ^ 0xffffffff) >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  function insidePoly(px, py, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > py) !== (yj > py)) &&
        (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  const scale = isMaskable ? 0.65 : 0.82;
  const cx = width / 2;
  const cy = height / 2;
  const s = (width / 32) * scale;
  const ox = cx - (16 * s);
  const oy = cy - (16 * s);

  function transform(poly) {
    return poly.map(([x, y]) => [ox + x * s, oy + y * s]);
  }

  const p1 = transform([[4, 28], [14, 4], [20, 4], [10, 28]]);
  const p2 = transform([[16, 28], [26, 4], [28, 4], [18, 28]]);

  const raw = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    raw[offset++] = 0;
    for (let x = 0; x < width; x++) {
      let r = 15, g = 20, b = 50, a = 255; // #0F1432

      if (insidePoly(x, y, p1)) {
        r = 255; g = 170; b = 0; // #FFAA00 Gold
      } else if (insidePoly(x, y, p2)) {
        r = 255; g = 0; b = 30; // #FF001E Red
      }

      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const idat = chunk('IDAT', zlib.deflateSync(raw));
  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, chunk('IEND', Buffer.alloc(0))]);
}

fs.writeFileSync('public/icon-192.png', createPng(192, 192));
fs.writeFileSync('public/icon-512.png', createPng(512, 512));
fs.writeFileSync('public/icon-maskable-512.png', createPng(512, 512, true));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="4" fill="#0F1432"/><polygon points="4,28 14,4 20,4 10,28" fill="#FFAA00"/><polygon points="16,28 26,4 28,4 18,28" fill="#FF001E"/></svg>`;
fs.writeFileSync('public/favicon.svg', svg);
console.log('Icons generated successfully.');

