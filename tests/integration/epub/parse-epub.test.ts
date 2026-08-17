import { describe, expect, it } from 'vitest';
import {
  EpubParseError,
  parseEpub,
} from '../../../src/infrastructure/epub/parse-epub';
import {
  makeEpubWithNcxOnly,
  makeValidEpub,
  makeZipWithDrmMarker,
  makeZipWithMalformedOpf,
  makeZipWithMissingOpf,
  makeZipWithMissingSpineItem,
  makeZipWithoutContainer,
} from './epub-fixtures';

describe('parseEpub', () => {
  it('normalizes metadata, spine order, TOC and resources deterministically', () => {
    const first = parseEpub(makeValidEpub(), { parserVersion: 'test-v1' });
    const second = parseEpub(makeValidEpub(), { parserVersion: 'test-v1' });

    expect(first).toEqual(second);
    expect(first.metadata).toMatchObject({
      title: '合成阅读测试书',
      creators: ['测试作者'],
      language: 'zh-CN',
    });
    expect(first.chapters.map((chapter) => chapter.sourceHref)).toEqual([
      'OPS/chapters/one.xhtml',
      'OPS/chapters/two.xhtml',
    ]);
    expect(first.toc).toEqual([
      {
        title: '第一章',
        href: 'OPS/chapters/one.xhtml#start',
        children: [{ title: '第一章细节', href: 'OPS/chapters/one.xhtml#detail', children: [] }],
      },
      { title: '第二章', href: 'OPS/chapters/two.xhtml', children: [] },
    ]);
    expect(first.assets).toEqual([
      { href: 'OPS/images/cover.bin', mediaType: 'image/png' },
    ]);
  });

  it('falls back to EPUB2 NCX when an EPUB3 navigation document is absent', () => {
    const book = parseEpub(makeEpubWithNcxOnly(), { parserVersion: 'test-v1' });

    expect(book.toc).toEqual([
      { title: 'NCX 第一章', href: 'OPS/chapters/one.xhtml#start', children: [] },
      { title: 'NCX 第二章', href: 'OPS/chapters/two.xhtml', children: [] },
    ]);
  });

  it('removes executable and remote XHTML content while retaining semantic blocks', () => {
    const book = parseEpub(makeValidEpub(), { parserVersion: 'test-v1' });
    const chapter = book.chapters[0];

    expect(chapter.safeXhtml).toContain('<h1 id="start">第一章</h1>');
    expect(chapter.safeXhtml).toContain('<p id="detail">合成第一段。</p>');
    expect(chapter.safeXhtml).not.toContain('<script');
    expect(chapter.safeXhtml).not.toContain('onclick=');
    expect(chapter.safeXhtml).not.toContain('<iframe');
    expect(chapter.safeXhtml).not.toContain('https://example.invalid');
  });

  it('keeps readable spine chapters and records a warning for a missing spine item', () => {
    const book = parseEpub(makeZipWithMissingSpineItem(), { parserVersion: 'test-v1' });

    expect(book.chapters).toHaveLength(2);
    expect(book.warnings).toContain('Missing manifest item for spine reference: ghost');
  });

  it.each([
    ['no_container', makeZipWithoutContainer()],
    ['no_opf', makeZipWithMissingOpf()],
    ['drm_encrypted', makeZipWithDrmMarker()],
    ['invalid_package', makeZipWithMalformedOpf()],
  ] as const)('classifies invalid EPUB input: %s', (code, bytes) => {
    expect(() => parseEpub(bytes, { parserVersion: 'test-v1' })).toThrow(EpubParseError);
    try {
      parseEpub(bytes, { parserVersion: 'test-v1' });
    } catch (error) {
      expect(error).toMatchObject({ code });
    }
  });
});
