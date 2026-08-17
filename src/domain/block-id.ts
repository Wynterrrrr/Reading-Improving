import type { BookId, ChapterId, ParagraphId } from './book';

function hashHex(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function createBookId(sourceHash: string): BookId {
  return `book_${sourceHash.slice(0, 12)}` as BookId;
}

export function createChapterId(sourceHash: string, spineIndex: number, title: string): ChapterId {
  return `ch_${String(spineIndex + 1).padStart(3, '0')}_${hashHex(`${sourceHash}:${title}`)}` as ChapterId;
}

export function createParagraphId(
  sourceHash: string,
  parserVersion: string,
  chapterId: ChapterId,
  paragraphIndex: number,
  text: string,
): ParagraphId {
  const fingerprint = `${sourceHash}:${parserVersion}:${chapterId}:${paragraphIndex}:${text}`;
  return `p_${String(paragraphIndex + 1).padStart(4, '0')}_${hashHex(fingerprint)}` as ParagraphId;
}

export function createContentHash(value: string): string {
  return hashHex(value);
}

export function createBytesHash(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) {
    text += String.fromCharCode(byte);
  }
  return hashHex(text);
}
