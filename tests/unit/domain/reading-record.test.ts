import { describe, expect, it } from 'vitest';
import { validateReadingRecord } from '../../../src/domain/reading-record';
import type { SourceRef } from '../../../src/domain/source-ref';

const sourceRef: SourceRef = {
  bookId: 'book_ab12cd34',
  sourceHash: 'a'.repeat(64),
  chapterId: 'ch_001_ef56ab78',
  chapterPath: 'LReading/Books/book_ab12cd34/chapters/001-example.md',
  paragraphId: 'p_0001_a1b2c3d4',
  wikilink: '[[LReading/Books/book_ab12cd34/chapters/001-example#^p_0001_a1b2c3d4]]',
  quoteSnapshot: '证据段落。',
  status: 'verified' as const,
};

describe('ReadingRecord validation', () => {
  it('accepts a source-backed record with a verified source reference', () => {
    expect(validateReadingRecord({
      id: 'rr_001',
      type: 'note',
      evidenceStatus: 'source-backed',
      bookId: 'book_ab12cd34',
      sourceRef,
      body: '我的理解。',
      createdAt: '2026-08-17T00:00:00.000Z',
      tags: [],
    })).toMatchObject({ evidenceStatus: 'source-backed' });
  });

  it('rejects source-backed records without a verified source reference', () => {
    expect(() => validateReadingRecord({
      id: 'rr_002',
      type: 'note',
      evidenceStatus: 'source-backed',
      bookId: 'book_ab12cd34',
      sourceRef: { ...sourceRef, status: 'needs-review' },
      body: '不能作为已验证证据。',
      createdAt: '2026-08-17T00:00:00.000Z',
      tags: [],
    })).toThrow('must use a verified SourceRef');
  });
});
