import type { RenderedBook } from './markdown-render';

export interface PlannedMarkdownFile {
  path: string;
  content: string;
  kind: 'generated' | 'user-notes';
}

export interface BookLayout {
  files: PlannedMarkdownFile[];
}

export interface BookLayoutOptions {
  creators: string[];
  parserVersion: string;
}

export function createBookLayout(book: RenderedBook, options: BookLayoutOptions): BookLayout {
  const root = `LReading/Books/${book.bookId}`;
  const chapterLinks = book.chapters
    .map((chapter) => `- [[${chapter.path.slice(0, -3)}|${chapter.path.split('/').pop()?.replace(/^\d{3}-/, '').replace(/\.md$/, '') ?? chapter.chapterId}]]`)
    .join('\n');
  const creatorLines = options.creators.map((creator) => `- ${creator}`).join('\n') || '- 未知';

  return {
    files: [
      {
        path: `${root}/书籍.md`,
        kind: 'generated',
        content: `---\ntype: lreading-book\nbookId: ${book.bookId}\ntitle: "${escapeYaml(book.title)}"\ncreators:\n${creatorLines}\ntags: []\nlreadingBookTags: []\nsourceHash: "${book.sourceHash}"\nparserVersion: "${escapeYaml(options.parserVersion)}"\n---\n\n<!-- LREADING:SYSTEM-START -->\n# ${book.title}\n\n- [[目录]]\n- [[阅读笔记与摘要]]\n\n## 章节\n${chapterLinks}\n<!-- LREADING:SYSTEM-END -->\n\n<!-- LREADING:USER-START -->\n<!-- LREADING:USER-END -->\n`,
      },
      {
        path: `${root}/目录.md`,
        kind: 'generated',
        content: `<!-- LREADING:SYSTEM-START -->\n# ${book.title}｜目录\n\n${chapterLinks}\n<!-- LREADING:SYSTEM-END -->\n\n<!-- LREADING:USER-START -->\n<!-- LREADING:USER-END -->\n`,
      },
      {
        path: `${root}/阅读笔记与摘要.md`,
        kind: 'user-notes',
        content: `---\ntype: lreading-reading-notes\nbookId: ${book.bookId}\nbook: "[[书籍]]"\ncreated: ""\nupdated: ""\n---\n\n# ${book.title}｜阅读笔记与摘要\n`,
      },
      ...book.chapters.map((chapter) => ({ path: chapter.path, content: chapter.markdown, kind: 'generated' as const })),
      {
        path: 'LReading/书架.md',
        kind: 'generated',
        content: `<!-- LREADING:SYSTEM-START -->\n# LReading 书架\n\n- [[${root}/书籍|${book.title}]]\n<!-- LREADING:SYSTEM-END -->\n\n<!-- LREADING:USER-START -->\n<!-- LREADING:USER-END -->\n`,
      },
    ],
  };
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
