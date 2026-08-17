import { describe, expect, it } from 'vitest';
import { validateSourceRef, type SourceRef } from '../../../src/domain/source-ref';

const verifiedSourceRef: SourceRef = {
  bookId: 'book_ab12cd34',
  sourceHash: 'a'.repeat(64),
  chapterId: 'ch_001_ef56ab78',
  chapterPath: 'LReading/Books/book_ab12cd34/chapters/001-example.md',
  paragraphId: 'p_0001_a1b2c3d4',
  wikilink: '[[LReading/Books/book_ab12cd34/chapters/001-example#^p_0001_a1b2c3d4]]',
  quoteSnapshot: '这是可验证的原文摘录。',
  status: 'verified' as const,
};

describe('SourceRef validation', () => {
  it('accepts a verified SourceRef whose wikilink points at its paragraph block', () => {
    expect(validateSourceRef(verifiedSourceRef)).toEqual(verifiedSourceRef);
  });

  it('accepts a SourceRef marked for later review without treating it as verified evidence', () => {
    expect(validateSourceRef({ ...verifiedSourceRef, status: 'needs-review' })).toEqual({
      ...verifiedSourceRef,
      status: 'needs-review',
    });
  });

  it('rejects a chapter path outside the LReading book namespace', () => {
    expect(() => validateSourceRef({ ...verifiedSourceRef, chapterPath: 'Other/book.md' })).toThrow();
  });

  it('rejects a wikilink whose block id does not equal paragraphId', () => {
    expect(() => validateSourceRef({ ...verifiedSourceRef, wikilink: '[[chapter#^p_other]]' })).toThrow();
  });

  it('rejects an empty quote snapshot', () => {
    expect(() => validateSourceRef({ ...verifiedSourceRef, quoteSnapshot: '' })).toThrow();
  });
});
