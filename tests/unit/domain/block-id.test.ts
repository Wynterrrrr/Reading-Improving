import { describe, expect, it } from 'vitest';
import { createBookId, createChapterId, createParagraphId } from '../../../src/domain/block-id';

describe('deterministic LReading identifiers', () => {
  const sourceHash = 'a'.repeat(64);

  it('creates stable safe book and chapter ids from the source hash and content', () => {
    expect(createBookId(sourceHash)).toBe(createBookId(sourceHash));
    expect(createBookId(sourceHash)).toMatch(/^book_[a-f0-9]+$/);
    expect(createChapterId(sourceHash, 0, '第一章')).toBe(createChapterId(sourceHash, 0, '第一章'));
    expect(createChapterId(sourceHash, 0, '第一章')).not.toBe(createChapterId(sourceHash, 0, '第二章'));
  });

  it('keeps duplicate paragraphs distinct while remaining deterministic', () => {
    const chapterId = createChapterId(sourceHash, 0, '第一章');
    const first = createParagraphId(sourceHash, 'parser-v1', chapterId, 0, '重复段落');
    const second = createParagraphId(sourceHash, 'parser-v1', chapterId, 1, '重复段落');

    expect(first).toMatch(/^p_\d{4}_[a-f0-9]+$/);
    expect(first).not.toBe(second);
    expect(first).toBe(createParagraphId(sourceHash, 'parser-v1', chapterId, 0, '重复段落'));
  });
});
