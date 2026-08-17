import { describe, expect, it } from 'vitest';
import { createAssetWritePlan } from '../../../src/domain/asset-plan';

const bytes = new Uint8Array([137, 80, 78, 71]);

describe('asset write plan', () => {
  it('keeps supported image MIME types, hashes destinations, and de-duplicates bytes', () => {
    const result = createAssetWritePlan('book_abc', [
      { href: 'OPS/cover.png', mediaType: 'image/png', content: bytes },
      { href: 'OPS/duplicate.png', mediaType: 'image/png', content: bytes },
      { href: 'OPS/style.css', mediaType: 'text/css', content: new Uint8Array([1]) },
    ]);

    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].path).toMatch(/^LReading\/Books\/book_abc\/assets\/[a-f0-9]+\.png$/);
    expect(result.warnings).toContain('Unsupported asset media type skipped: text/css');
  });

  it('records a warning for a missing asset payload', () => {
    const result = createAssetWritePlan('book_abc', [
      { href: 'OPS/missing.jpg', mediaType: 'image/jpeg' },
    ]);

    expect(result.assets).toEqual([]);
    expect(result.warnings).toContain('Missing asset payload: OPS/missing.jpg');
  });
});
