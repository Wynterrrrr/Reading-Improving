const DRIVE_LETTER_PATH = /^[A-Za-z]:/;

export class UnsafeVaultPathError extends Error {
  constructor(path: string, reason: string) {
    super(`Unsafe Vault path "${path}": ${reason}`);
    this.name = 'UnsafeVaultPathError';
  }
}

/**
 * Validates an Obsidian virtual path. These paths are relative to the Vault
 * root and must use forward slashes on every host platform.
 */
export function assertSafeVaultPath(path: string): string {
  if (path.length === 0) {
    throw new UnsafeVaultPathError(path, 'path must not be empty');
  }
  if (path.startsWith('/') || DRIVE_LETTER_PATH.test(path)) {
    throw new UnsafeVaultPathError(path, 'path must be relative to the Vault root');
  }
  if (path.includes('\\')) {
    throw new UnsafeVaultPathError(path, 'backslashes are not valid Vault path separators');
  }

  const segments = path.split('/');
  if (segments.some((segment) => segment.length === 0 || segment === '.' || segment === '..')) {
    throw new UnsafeVaultPathError(path, 'path contains an empty or traversal segment');
  }

  return path;
}

export function isPathInsidePrefix(path: string, prefix: string): boolean {
  const safePath = assertSafeVaultPath(path);
  const safePrefix = assertSafeVaultPath(prefix);
  return safePath === safePrefix || safePath.startsWith(`${safePrefix}/`);
}

export function assertPathInsidePrefix(path: string, prefix: string): string {
  if (!isPathInsidePrefix(path, prefix)) {
    throw new UnsafeVaultPathError(path, `path must stay inside ${prefix}/`);
  }
  return path;
}
