import { assertPathInsidePrefix, assertSafeVaultPath } from './vault-path';
import type { BookId, ChapterId, ParagraphId } from './book';

export type SourceStatus = 'verified' | 'needs-review' | 'missing';

export interface SourceRef {
  bookId: BookId;
  sourceHash: string;
  chapterId: ChapterId;
  chapterPath: string;
  paragraphId: ParagraphId;
  wikilink: string;
  quoteSnapshot: string;
  status: SourceStatus;
}

export class InvalidSourceRefError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSourceRefError';
  }
}

function invalid(message: string): never {
  throw new InvalidSourceRefError(message);
}

export function validateSourceRef(ref: SourceRef): SourceRef {
  if (!ref.bookId.startsWith('book_') || !ref.chapterId.startsWith('ch_') || !ref.paragraphId.startsWith('p_')) {
    return invalid('SourceRef IDs use the book_/ch_/p_ namespaces');
  }
  if (!/^[a-f0-9]{64}$/.test(ref.sourceHash)) {
    return invalid('SourceRef sourceHash must be a SHA-256 hex string');
  }
  try {
    assertSafeVaultPath(ref.chapterPath);
    assertPathInsidePrefix(ref.chapterPath, `LReading/Books/${ref.bookId}`);
  } catch (error) {
    return invalid(error instanceof Error ? error.message : 'invalid chapterPath');
  }
  if (ref.quoteSnapshot.trim().length === 0) {
    return invalid('SourceRef quoteSnapshot must not be empty');
  }
  if (!['verified', 'needs-review', 'missing'].includes(ref.status)) {
    return invalid('SourceRef status is invalid');
  }
  const expectedSuffix = `#^${ref.paragraphId}]]`;
  if (!ref.wikilink.endsWith(expectedSuffix)) {
    return invalid('SourceRef wikilink must point at paragraphId');
  }
  return ref;
}
