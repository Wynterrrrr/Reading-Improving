import { describe, expect, it } from 'vitest';
import { createBookLayout } from '../../../src/domain/book-layout';
import type { RenderedBook } from '../../../src/domain/markdown-render';

const rendered: RenderedBook = {
  bookId: 'book_ab12cd34',
  title: '合成阅读测试书',
  sourceHash: 'a'.repeat(64),
  chapters: [{
    chapterId: 'ch_001_ef56ab78',
    path: 'LReading/Books/book_ab12cd34/chapters/001-第一章.md',
    markdown: '# 第一章',
    paragraphs: [],
    warnings: [],
  }],
  warnings: [],
};

describe('book-level Markdown layout', () => {
  it('plans only book, toc, notes, chapter and bookshelf files', () => {
    const layout = createBookLayout(rendered, { creators: ['测试作者'], parserVersion: 'parser-v1' });
    const paths = layout.files.map((file) => file.path);

    expect(paths).toContain('LReading/Books/book_ab12cd34/书籍.md');
    expect(paths).toContain('LReading/Books/book_ab12cd34/目录.md');
    expect(paths).toContain('LReading/Books/book_ab12cd34/阅读笔记与摘要.md');
    expect(paths).toContain('LReading/Books/book_ab12cd34/chapters/001-第一章.md');
    expect(paths).toContain('LReading/书架.md');
    expect(paths.some((path) => path.endsWith('数据摘要.md'))).toBe(false);
  });

  it('keeps user and system blocks and creates no fake reading records', () => {
    const layout = createBookLayout(rendered, { creators: [], parserVersion: 'parser-v1' });
    const bookNote = layout.files.find((file) => file.path.endsWith('/书籍.md'))?.content ?? '';
    const toc = layout.files.find((file) => file.path.endsWith('/目录.md'))?.content ?? '';
    const notes = layout.files.find((file) => file.path.endsWith('/阅读笔记与摘要.md'))?.content ?? '';

    expect(bookNote).toContain('<!-- LREADING:SYSTEM-START -->');
    expect(bookNote).toContain('<!-- LREADING:USER-START -->');
    expect(toc).toContain('[[LReading/Books/book_ab12cd34/chapters/001-第一章|第一章]]');
    expect(notes).toContain('type: lreading-reading-notes');
    expect(notes).not.toContain('LREADING:RECORD');
  });
});
