import fs from "fs";
import path from "path";
import zlib from "zlib";

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makePng(size) {
  const width = size;
  const height = size;

  // Emerald green: rgb(16, 185, 129) = 0x10, 0xb9, 0x81
  const bgR = 16, bgG = 185, bgB = 129;
  // White: rgb(255, 255, 255)
  const fgR = 255, fgG = 255, fgB = 255;

  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;

  const radius = Math.floor(size * 0.22);
  const pad = Math.floor(size * 0.15);

  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter type: none

    for (let x = 0; x < width; x++) {
      // Rounded rect check
      let inRect = false;
      const dx = Math.max(0, Math.max(radius - x, x - (width - 1 - radius)));
      const dy = Math.max(0, Math.max(radius - y, y - (height - 1 - radius)));
      if (dx * dx + dy * dy <= radius * radius) {
        inRect = true;
      }

      if (!inRect) {
        // Transparent
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
        raw[offset++] = 0;
        continue;
      }

      // Draw stylized 'P' for PressProtocol
      // Stem: x in [0.28*size, 0.40*size], y in [0.24*size, 0.76*size]
      // Loop top bar: x in [0.40*size, 0.65*size], y in [0.24*size, 0.36*size]
      // Loop right bar: x in [0.60*size, 0.72*size], y in [0.30*size, 0.52*size]
      // Loop bottom bar: x in [0.40*size, 0.65*size], y in [0.46*size, 0.56*size]
      const nx = x / size;
      const ny = y / size;

      const isStem = nx >= 0.28 && nx <= 0.42 && ny >= 0.24 && ny <= 0.76;
      const isLoopTop = nx >= 0.40 && nx <= 0.68 && ny >= 0.24 && ny <= 0.38;
      const isLoopRight = nx >= 0.56 && nx <= 0.72 && ny >= 0.28 && ny <= 0.52;
      const isLoopBottom = nx >= 0.40 && nx <= 0.68 && ny >= 0.42 && ny <= 0.54;

      if (isStem || isLoopTop || isLoopRight || isLoopBottom) {
        raw[offset++] = fgR;
        raw[offset++] = fgG;
        raw[offset++] = fgB;
        raw[offset++] = 255;
      } else {
        raw[offset++] = bgR;
        raw[offset++] = bgG;
        raw[offset++] = bgB;
        raw[offset++] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(raw);

  // PNG Header
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = Buffer.alloc(12 + 13);
  ihdrChunk.writeUInt32BE(13, 0);
  ihdrChunk.write("IHDR", 4);
  ihdrData.copy(ihdrChunk, 8);
  ihdrChunk.writeUInt32BE(crc32(ihdrChunk.subarray(4, 21)), 21);

  // IDAT
  const idatChunk = Buffer.alloc(12 + deflated.length);
  idatChunk.writeUInt32BE(deflated.length, 0);
  idatChunk.write("IDAT", 4);
  deflated.copy(idatChunk, 8);
  idatChunk.writeUInt32BE(crc32(idatChunk.subarray(4, 8 + deflated.length)), 8 + deflated.length);

  // IEND
  const iendChunk = Buffer.alloc(12);
  iendChunk.writeUInt32BE(0, 0);
  iendChunk.write("IEND", 4);
  iendChunk.writeUInt32BE(crc32(Buffer.from("IEND")), 8);

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.resolve("integrations/browser-extension/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const buf = makePng(size);
  const outPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(outPath, buf);
  console.log(`Generated ${outPath} (${buf.length} bytes)`);
});
