export interface EpubZipLimits {
  maxEntries: number;
  maxUncompressedBytes: number;
  maxCompressionRatio: number;
}

export interface ZipEntryMetadata {
  path: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
}

export interface ZipSafetyInspection {
  entries: ZipEntryMetadata[];
  totalUncompressedBytes: number;
}

const DEFAULT_LIMITS: EpubZipLimits = {
  maxEntries: 2_000,
  maxUncompressedBytes: 200 * 1024 * 1024,
  maxCompressionRatio: 100,
};

const END_OF_CENTRAL_DIRECTORY = 0x0605_4b50;
const CENTRAL_DIRECTORY_FILE_HEADER = 0x0201_4b50;
const MAX_EOCD_COMMENT_BYTES = 0xffff;

export class EpubZipSafetyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EpubZipSafetyError';
  }
}

export function inspectZipSafety(bytes: Uint8Array, limits: Partial<EpubZipLimits> = {}): ZipSafetyInspection {
  const effectiveLimits = { ...DEFAULT_LIMITS, ...limits };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const eocdOffset = findEndOfCentralDirectory(view);
  const entryCount = view.getUint16(eocdOffset + 10, true);
  const centralDirectorySize = view.getUint32(eocdOffset + 12, true);
  const centralDirectoryOffset = view.getUint32(eocdOffset + 16, true);

  if (entryCount > effectiveLimits.maxEntries) {
    throw new EpubZipSafetyError(`ZIP has too many entries: ${entryCount}`);
  }
  if (centralDirectoryOffset + centralDirectorySize > bytes.byteLength) {
    throw new EpubZipSafetyError('ZIP central directory exceeds archive bounds');
  }

  const decoder = new TextDecoder();
  const entries: ZipEntryMetadata[] = [];
  let totalUncompressedBytes = 0;
  let offset = centralDirectoryOffset;

  for (let index = 0; index < entryCount; index += 1) {
    assertRange(view, offset, 46, 'ZIP central directory entry is truncated');
    if (view.getUint32(offset, true) !== CENTRAL_DIRECTORY_FILE_HEADER) {
      throw new EpubZipSafetyError('ZIP central directory entry signature is invalid');
    }

    const compressionMethod = view.getUint16(offset + 10, true);
    const compressedSize = view.getUint32(offset + 20, true);
    const uncompressedSize = view.getUint32(offset + 24, true);
    const pathLength = view.getUint16(offset + 28, true);
    const extraLength = view.getUint16(offset + 30, true);
    const commentLength = view.getUint16(offset + 32, true);
    const entryLength = 46 + pathLength + extraLength + commentLength;
    assertRange(view, offset, entryLength, 'ZIP central directory entry exceeds archive bounds');

    const path = decoder.decode(bytes.subarray(offset + 46, offset + 46 + pathLength));
    assertSafeZipEntryPath(path);
    totalUncompressedBytes += uncompressedSize;
    if (totalUncompressedBytes > effectiveLimits.maxUncompressedBytes) {
      throw new EpubZipSafetyError('ZIP exceeds uncompressed size limit');
    }
    if (uncompressedSize > 0 && compressedSize === 0) {
      throw new EpubZipSafetyError(`ZIP entry has an invalid compressed size: ${path}`);
    }
    if (compressedSize > 0 && uncompressedSize / compressedSize > effectiveLimits.maxCompressionRatio) {
      throw new EpubZipSafetyError(`ZIP entry exceeds compression ratio limit: ${path}`);
    }

    entries.push({ path, compressedSize, uncompressedSize, compressionMethod });
    offset += entryLength;
  }

  return {
    entries: entries.sort((left, right) => left.path.localeCompare(right.path)),
    totalUncompressedBytes,
  };
}

function findEndOfCentralDirectory(view: DataView): number {
  const minimumLength = 22;
  if (view.byteLength < minimumLength) {
    throw new EpubZipSafetyError('EPUB is not a valid ZIP archive');
  }

  const earliest = Math.max(0, view.byteLength - minimumLength - MAX_EOCD_COMMENT_BYTES);
  for (let offset = view.byteLength - minimumLength; offset >= earliest; offset -= 1) {
    if (view.getUint32(offset, true) === END_OF_CENTRAL_DIRECTORY) {
      const commentLength = view.getUint16(offset + 20, true);
      if (offset + minimumLength + commentLength === view.byteLength) {
        return offset;
      }
    }
  }
  throw new EpubZipSafetyError('EPUB is not a valid ZIP archive');
}

function assertRange(view: DataView, offset: number, length: number, message: string): void {
  if (offset < 0 || length < 0 || offset + length > view.byteLength) {
    throw new EpubZipSafetyError(message);
  }
}

function assertSafeZipEntryPath(path: string): void {
  const directory = path.endsWith('/');
  const normalized = directory ? path.slice(0, -1) : path;
  if (
    normalized.length === 0 ||
    normalized.startsWith('/') ||
    /^[A-Za-z]:/.test(normalized) ||
    normalized.includes('\\') ||
    normalized.split('/').some((segment) => segment === '..' || segment.length === 0)
  ) {
    throw new EpubZipSafetyError(`ZIP entry path is unsafe: ${path}`);
  }
}
