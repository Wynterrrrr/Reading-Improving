export type BookId = `book_${string}`;
export type ChapterId = `ch_${string}`;
export type ParagraphId = `p_${string}`;

export interface BookManifest {
  schemaVersion: 1;
  bookId: BookId;
  title: string;
  creators: string[];
  language?: string;
  sourceHash: string;
  parserVersion: string;
  importedAt: string;
  chapterCount: number;
  assetCount: number;
  chapterPaths: string[];
  tocPath: string;
  bookNotePath: string;
  notesPath: string;
}

export interface Chapter {
  bookId: BookId;
  chapterId: ChapterId;
  chapterIndex: number;
  title: string;
  sourceHref: string;
  sourceHash: string;
  path: string;
}

export interface Paragraph {
  paragraphId: ParagraphId;
  chapterId: ChapterId;
  text: string;
}
