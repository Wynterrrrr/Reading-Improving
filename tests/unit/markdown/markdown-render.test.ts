import { describe, expect, it } from 'vitest';
import { renderBook } from '../../../src/domain/markdown-render';
import type { NormalizedBook } from '../../../src/domain/epub-normalize';

const book: NormalizedBook = {
  sourceHash: 'a'.repeat(64),
  parserVersion: 'parser-v1',
  metadata: { title: '合成阅读测试书', creators: ['测试作者'], language: 'zh-CN' },
  chapters: [{
    sourceHref: 'OPS/chapters/one.xhtml',
    spineIndex: 0,
    title: '第一章',
    safeXhtml: '<h1 id="start">第一章</h1><p id="detail">普通 <strong>强调</strong> <em>斜体</em><br>换行 <a href="relative.html">链接</a>。</p><ul><li>项目一</li><li>项目二</li></ul><blockquote>引用内容</blockquote><img src="images/cover.png" alt="封面"><table><tr><td>复杂表格</td></tr></table>',
  }],
  toc: [],
  assets: [],
  warnings: [],
};

describe('Markdown rendering', () => {
  it('renders semantic Markdown with a stable block id for every selectable block', () => {
    const rendered = renderBook(book);
    const chapter = rendered.chapters[0];

    expect(chapter.markdown).toContain('type: lreading-chapter');
    expect(chapter.markdown).toContain('book: "[[书籍]]"');
    expect(chapter.markdown).not.toContain('lreadingBookTags:\n  -');
    expect(chapter.markdown).toContain('# 第一章');
    expect(chapter.markdown).toContain('**强调**');
    expect(chapter.markdown).toContain('*斜体*');
    expect(chapter.markdown).toContain('- 项目一');
    expect(chapter.markdown).toContain('> 引用内容');
    expect(chapter.markdown).toContain('![封面](images/cover.png)');
    expect(chapter.markdown).toMatch(/\^p_[a-f0-9]+/);
    expect(chapter.warnings).toContain('Unsupported table preserved as a warning');
    expect(chapter.markdown).not.toContain('<script');
    expect(chapter.markdown).not.toContain('https://');
  });

  it('maps rendered paragraph blocks to verified source references', () => {
    const rendered = renderBook(book);
    const first = rendered.chapters[0].paragraphs[0];

    expect(first.sourceRef.status).toBe('verified');
    expect(first.sourceRef.wikilink).toContain(`#^${first.paragraphId}]]`);
    expect(first.sourceRef.chapterPath).toBe(rendered.chapters[0].path);
  });
});
