import type { BookId } from './book';
import { validateSourceRef, type SourceRef } from './source-ref';

export type ReadingRecordType = 'quote' | 'note' | 'summary' | 'question' | 'review' | 'insight';
export type EvidenceStatus =
  | 'source-backed'
  | 'personal-understanding'
  | 'inference'
  | 'unresolved'
  | 'personal-association';

export interface ReadingRecord {
  id: string;
  type: ReadingRecordType;
  evidenceStatus: EvidenceStatus;
  bookId: BookId;
  sourceRef?: SourceRef;
  body: string;
  createdAt: string;
  tags: string[];
}

export function validateReadingRecord(record: ReadingRecord): ReadingRecord {
  if (record.body.trim().length === 0) {
    throw new Error('ReadingRecord body must not be empty');
  }
  if (record.evidenceStatus === 'source-backed') {
    if (!record.sourceRef) {
      throw new Error('Source-backed ReadingRecord must include a verified SourceRef');
    }
    const sourceRef = validateSourceRef(record.sourceRef);
    if (sourceRef.status !== 'verified') {
      throw new Error('Source-backed ReadingRecord must use a verified SourceRef');
    }
  }
  return record;
}
