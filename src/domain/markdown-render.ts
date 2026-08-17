import { createBookId, createChapterId, createParagraphId } from './block-id';
import type { BookId, ChapterId, ParagraphId } from './book';
import type { NormalizedBook, NormalizedChapter } from './epub-normalize';
import type { SourceRef } from './source-ref';

export interface RenderedParagraph {
  paragraphId: ParagraphId;
  text: string;
  sourceRef: SourceRef;
}

export interface RenderedChapter {
  chapterId: ChapterId;
  path: string;
  markdown: string;
  paragraphs: RenderedParagraph[];
  warnings: string[];
}

export interface RenderedBook {
  bookId: BookId;
  title: string;
  sourceHash: string;
  chapters: RenderedChapter[];
  warnings: string[];
}

const BLOCK_PATTERN = /<(h[1-6]|p|li|blockquote|pre)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/gi;

export function renderBook(book: NormalizedBook): RenderedBook {
  const bookId = createBookId(book.sourceHash);
  const chapters = book.chapters.map((chapter) => renderChapter(book, bookId, chapter));
  return {
    bookId,
    title: book.metadata.title,
    sourceHash: book.sourceHash,
    chapters,
    warnings: [...book.warnings, ...chapters.flatMap((chapter) => chapter.warnings)],
  };
}

function renderChapter(book: NormalizedBook, bookId: BookId, chapter: NormalizedChapter): RenderedChapter {
  const chapterId = createChapterId(book.sourceHash, chapter.spineIndex, chapter.title);
  const fileName = `${String(chapter.spineIndex + 1).padStart(3, '0')}-${safeFileStem(chapter.title)}.md`;
  const path = `LReading/Books/${bookId}/chapters/${fileName}`;
  const warnings: string[] = [];
  const blocks = extractBlocks(chapter.safeXhtml, warnings);
  const paragraphs = blocks.map((block, paragraphIndex) => {
    const paragraphId = createParagraphId(book.sourceHash, book.parserVersion, chapterId, paragraphIndex, block.plainText);
    const sourceRef: SourceRef = {
      bookId,
      sourceHash: book.sourceHash,
      chapterId,
      chapterPath: path,
      paragraphId,
      wikilink: `[[${path.slice(0, -3)}#^${paragraphId}]]`,
      quoteSnapshot: block.plainText.slice(0, 500),
      status: 'verified',
    };
    return { paragraphId, text: block.markdown, sourceRef };
  });

  const frontmatter = [
    '---',
    'type: lreading-chapter',
    `bookId: ${bookId}`,
    'book: "[[书籍]]"',
    `chapterId: ${chapterId}`,
    `chapterIndex: ${chapter.spineIndex + 1}`,
    `title: "${escapeYaml(chapter.title)}"`,
    `sourceHref: "${escapeYaml(chapter.sourceHref)}"`,
    `sourceHash: "${book.sourceHash}"`,
    'lreadingBookTags: []',
    '---',
  ].join('\n');
  const content = paragraphs.map((paragraph) => `${paragraph.text} ^${paragraph.paragraphId}`).join('\n\n');

  return {
    chapterId,
    path,
    markdown: `${frontmatter}\n\n${content}\n`,
    paragraphs,
    warnings,
  };
}

function extractBlocks(xhtml: string, warnings: string[]): Array<{ markdown: string; plainText: string }> {
  if (/<(?:table|math|svg)\b/i.test(xhtml)) {
    if (/<table\b/i.test(xhtml)) {
      warnings.push('Unsupported table preserved as a warning');
    }
    if (/<math\b/i.test(xhtml)) {
      warnings.push('Unsupported MathML preserved as a warning');
    }
    if (/<svg\b/i.test(xhtml)) {
      warnings.push('Unsupported SVG preserved as a warning');
    }
  }

  const blocks: Array<{ markdown: string; plainText: string }> = [];
  for (const match of xhtml.matchAll(BLOCK_PATTERN)) {
    const tag = match[1].toLowerCase();
    const inner = match[2];
    const inline = renderInline(inner);
    const plainText = toPlainText(inner);
    if (!plainText) {
      continue;
    }
    const markdown = tag.startsWith('h')
      ? `${'#'.repeat(Number(tag.slice(1)))} ${inline}`
      : tag === 'li'
        ? `- ${inline}`
        : tag === 'blockquote'
          ? inline.split('\n').map((line) => `> ${line}`).join('\n')
          : tag === 'pre'
            ? `\`\`\`\n${plainText}\n\`\`\``
            : inline;
    blocks.push({ markdown, plainText });
  }
  const standaloneImages = [...xhtml.matchAll(/<img\b([^>]*)>/gi)];
  for (const match of standaloneImages) {
    const source = readAttribute(match[1], 'src');
    const alt = readAttribute(match[1], 'alt') ?? '';
    if (source && isSafeRelativeReference(source)) {
      blocks.push({ markdown: `![${alt}](${source})`, plainText: alt || source });
    }
  }
  return blocks;
}

function renderInline(value: string): string {
  let rendered = value;
  rendered = rendered.replace(/<br\s*\/?\s*>/gi, '\n');
  rendered = rendered.replace(/<(strong|b)\b[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**');
  rendered = rendered.replace(/<(em|i)\b[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*');
  rendered = rendered.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (_match, attributes: string, text: string) => {
    const href = readAttribute(attributes, 'href');
    const label = renderInline(text);
    return href && isSafeRelativeReference(href) ? `[${label}](${href})` : label;
  });
  rendered = rendered.replace(/<img\b([^>]*)>/gi, (_match, attributes: string) => {
    const source = readAttribute(attributes, 'src');
    const alt = readAttribute(attributes, 'alt') ?? '';
    return source && isSafeRelativeReference(source) ? `![${alt}](${source})` : '';
  });
  rendered = rendered.replace(/<[^>]+>/g, '');
  return decodeEntities(rendered).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function toPlainText(value: string): string {
  return decodeEntities(value.replace(/<br\s*\/?\s*>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
}

function readAttribute(attributes: string, name: string): string | undefined {
  const match = new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i').exec(attributes);
  return match?.[1];
}

function isSafeRelativeReference(value: string): boolean {
  return !/^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value) && !value.includes('..') && !value.includes('\\');
}

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function safeFileStem(title: string): string {
  const stem = title.replace(/[\\/:*?"<>|]/g, '-').trim().replace(/\s+/g, '-');
  return stem || 'untitled';
}

function escapeYaml(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
