import { describe, expect, it } from 'vitest';
import { assertSafeVaultPath, isPathInsidePrefix } from '../../../src/domain/vault-path';

describe('Vault virtual paths', () => {
  it('accepts a relative path inside the LReading namespace', () => {
    expect(assertSafeVaultPath('LReading/Books/book_x/书籍.md')).toBe('LReading/Books/book_x/书籍.md');
  });

  it.each([
    '',
    '/etc/passwd',
    'C:\\Users\\Wynter\\secret.md',
    'LReading/Books/../secret.md',
    '../LReading/Books/book_x/书籍.md',
    'LReading\\Books\\book_x\\书籍.md',
    'LReading//Books/book_x/书籍.md',
  ])('rejects an unsafe virtual path: %s', (path) => {
    expect(() => assertSafeVaultPath(path)).toThrow();
  });

  it('checks namespace membership on whole path segments', () => {
    expect(isPathInsidePrefix('LReading/Books/book_x/书籍.md', 'LReading')).toBe(true);
    expect(isPathInsidePrefix('LReading', 'LReading')).toBe(true);
    expect(isPathInsidePrefix('LReadingX/Books/book_x/书籍.md', 'LReading')).toBe(false);
    expect(isPathInsidePrefix('Other/LReading/Books/book_x/书籍.md', 'LReading')).toBe(false);
  });
});
