import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Public Static Assets Integrity', () => {
  const logosDir = path.resolve(__dirname, '../public/logos');

  const featuredIcons = [
    { name: 'craftyai.png', width: 500, height: 500 },
    { name: 'dzeconomy.png', width: 512, height: 512 },
    { name: 'georestrict.png', width: 1024, height: 1024 },
    { name: 'onlysleep.png', width: 500, height: 500 },
    { name: 'redstonereboot.png', width: 1024, height: 1024 },
    { name: 'velocitynavigator.png', width: 1024, height: 1024 },
    { name: 'zdiscord.png', width: 1088, height: 1088 },
  ];

  it('verifies all 7 featured plugin icons exist, are non-empty, and are valid square PNGs', () => {
    for (const icon of featuredIcons) {
      const filePath = path.join(logosDir, icon.name);
      expect(fs.existsSync(filePath), `Icon file ${icon.name} should exist`).toBe(true);

      const buf = fs.readFileSync(filePath);
      expect(buf.length, `Icon ${icon.name} should have non-zero size`).toBeGreaterThan(0);

      // Verify PNG magic header: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
      const isPng =
        buf[0] === 0x89 &&
        buf[1] === 0x50 &&
        buf[2] === 0x4e &&
        buf[3] === 0x47 &&
        buf[4] === 0x0d &&
        buf[5] === 0x0a &&
        buf[6] === 0x1a &&
        buf[7] === 0x0a;
      expect(isPng, `File ${icon.name} should have valid PNG signature`).toBe(true);

      // Verify IHDR width and height
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      expect(width, `${icon.name} width should match expected`).toBe(icon.width);
      expect(height, `${icon.name} height should match expected`).toBe(icon.height);
      expect(width, `${icon.name} should be square`).toBe(height);
    }
  });

  it('verifies core brand assets exist and are intact', () => {
    const brandFiles = [
      'master_c1_code_horns_lockup.png',
      'master_c1_code_horns_badge.png',
      'master_c1_code_horns_mark.png',
    ];

    for (const file of brandFiles) {
      const filePath = path.join(logosDir, file);
      expect(fs.existsSync(filePath), `Brand asset ${file} should exist`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size, `Brand asset ${file} should be non-empty`).toBeGreaterThan(1000);
    }
  });
});
