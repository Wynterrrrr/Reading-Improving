const SYSTEM_START = '<!-- LREADING:SYSTEM-START -->';
const SYSTEM_END = '<!-- LREADING:SYSTEM-END -->';
const USER_START = '<!-- LREADING:USER-START -->';
const USER_END = '<!-- LREADING:USER-END -->';

export class SystemBlockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SystemBlockError';
  }
}

function allIndices(document: string, marker: string): number[] {
  const indices: number[] = [];
  let index = document.indexOf(marker);
  while (index !== -1) {
    indices.push(index);
    index = document.indexOf(marker, index + marker.length);
  }
  return indices;
}

function exactlyOne(document: string, marker: string): number {
  const indices = allIndices(document, marker);
  if (indices.length !== 1) {
    throw new SystemBlockError(`Expected exactly one ${marker} marker, found ${indices.length}`);
  }
  return indices[0];
}

export function replaceSystemBlock(document: string, replacement: string): string {
  const systemStart = exactlyOne(document, SYSTEM_START);
  const systemEnd = exactlyOne(document, SYSTEM_END);
  const userStart = exactlyOne(document, USER_START);
  const userEnd = exactlyOne(document, USER_END);

  if (systemStart >= systemEnd || userStart >= userEnd) {
    throw new SystemBlockError('Start marker must precede its matching end marker');
  }

  const rangesOverlap = systemStart < userEnd && userStart < systemEnd;
  if (rangesOverlap) {
    throw new SystemBlockError('System and user blocks must not overlap or nest');
  }

  const contentStart = systemStart + SYSTEM_START.length;
  const before = document.slice(0, contentStart);
  const after = document.slice(systemEnd);
  const normalizedReplacement = replacement.length === 0 ? '' : `\n${replacement.trimEnd()}\n`;

  return `${before}${normalizedReplacement}${after}`;
}
