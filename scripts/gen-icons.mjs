// 간단한 브랜드 아이콘 PNG 생성기 (외부 의존성 없음).
// 파란 배경 + 가운데 밝은 사각형 마크. maskable safe-zone 고려.
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xedb88320 : c >>> 1;
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, "ascii");
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crc]);
}
function png(size, draw) {
  const bpp = 3;
  const stride = size * bpp;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = draw(x, y);
      const o = y * (stride + 1) + 1 + x * bpp;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const BRAND = [47, 106, 83]; // #2f6a53 세이지·파인 그린
const ACCENT = [201, 162, 78]; // #c9a24e 뮤트 허니골드
const LIGHT = [255, 255, 255];

function make(size) {
  return png(size, (x, y) => {
    const c = size / 2;
    const d = Math.max(Math.abs(x - c), Math.abs(y - c));
    // 가운데 흰 라운드 사각형
    if (d < size * 0.26) return LIGHT;
    // 흰 사각형을 감싸는 얇은 노란 포인트 링
    if (d < size * 0.31) return ACCENT;
    // 녹색 배경
    return BRAND;
  });
}

mkdirSync(new URL("../public/icons/", import.meta.url), { recursive: true });
for (const s of [192, 512]) {
  const out = new URL(`../public/icons/icon-${s}.png`, import.meta.url);
  writeFileSync(out, make(s));
  console.log("wrote", out.pathname);
}
