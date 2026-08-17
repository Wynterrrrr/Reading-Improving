import { describe, expect, it } from 'vitest';
import { strToU8, zipSync } from 'fflate';
import { EpubZipSafetyError, inspectZipSafety } from '../../../src/infrastructure/epub/zip-safety';

function zip(entries: Record<string, string>): Uint8Array {
  return zipSync(Object.fromEntries(Object.entries(entries).map(([path, content]) => [path, strToU8(content)])));
}

describe('EPUB ZIP safety', () => {
  it('accepts a small relative-path ZIP and returns its entry metadata before extraction', () => {
    const result = inspectZipSafety(zip({
      mimetype: 'application/epub+zip',
      'META-INF/container.xml': '<container/>',
    }));

    expect(result.entries.map((entry) => entry.path)).toEqual(['META-INF/container.xml', 'mimetype']);
  });

  it('accepts a safe ZIP directory entry before extraction', () => {
    const result = inspectZipSafety(zip({
      'OPS/': '',
      'OPS/chapter.xhtml': '<html/>',
    }));

    expect(result.entries.map((entry) => entry.path)).toEqual(['OPS/', 'OPS/chapter.xhtml']);
  });

  it.each([
    '../outside.txt',
    '/absolute.txt',
    'C:\\outside.txt',
    'OPS/../../outside.txt',
  ])('rejects a ZIP path escape before extraction: %s', (path) => {
    expect(() => inspectZipSafety(zip({ [path]: 'unsafe' }))).toThrow(EpubZipSafetyError);
  });

  it('rejects too many entries before extraction', () => {
    expect(() => inspectZipSafety(zip({ a: '1', b: '2' }), { maxEntries: 1 })).toThrow('too many entries');
  });

  it('rejects excessive uncompressed bytes before extraction', () => {
    expect(() => inspectZipSafety(zip({ chapter: '12345' }), { maxUncompressedBytes: 4 })).toThrow(
      'uncompressed size limit',
    );
  });

  it('rejects a suspicious compression ratio before extraction', () => {
    expect(() => inspectZipSafety(zip({ repeated: 'x'.repeat(10_000) }), { maxCompressionRatio: 2 })).toThrow(
      'compression ratio limit',
    );
  });

  it('rejects non-ZIP bytes with a classified error', () => {
    expect(() => inspectZipSafety(strToU8('not a zip'))).toThrow('not a valid ZIP archive');
  });
});
