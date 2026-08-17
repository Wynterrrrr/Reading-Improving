import {
  appendFile,
  mkdir as makeDirectory,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import { dirname, relative, resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { VaultAdapter } from '../../application/ports/vault';
import { assertSafeVaultPath } from '../../domain/vault-path';

export class NodeVaultAdapter implements VaultAdapter {
  private readonly root: string;

  constructor(baseDirectory: string) {
    this.root = resolve(baseDirectory);
  }

  async readFile(path: string): Promise<string | null> {
    try {
      return await readFile(this.resolvePath(path), 'utf8');
    } catch (error) {
      if (isNotFound(error)) {
        return null;
      }
      throw error;
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.atomicWrite(path, content);
  }

  async writeBinary(path: string, content: Uint8Array): Promise<void> {
    await this.atomicWrite(path, content);
  }

  async appendLine(path: string, line: string): Promise<void> {
    const destination = this.resolvePath(path);
    await makeDirectory(dirname(destination), { recursive: true });
    await appendFile(destination, `${line}\n`, 'utf8');
  }

  async exists(path: string): Promise<boolean> {
    try {
      await stat(this.resolvePath(path));
      return true;
    } catch (error) {
      if (isNotFound(error)) {
        return false;
      }
      throw error;
    }
  }

  async listFiles(directory: string): Promise<string[]> {
    const safeDirectory = assertSafeVaultPath(directory);
    const absoluteDirectory = this.resolvePath(safeDirectory);
    if (!(await this.exists(safeDirectory))) {
      return [];
    }

    const files: string[] = [];
    await this.collectFiles(absoluteDirectory, safeDirectory, files);
    return files.sort();
  }

  async mkdir(directory: string): Promise<void> {
    await makeDirectory(this.resolvePath(directory), { recursive: true });
  }

  async remove(path: string): Promise<void> {
    await rm(this.resolvePath(path), { force: true, recursive: false });
  }

  private resolvePath(path: string): string {
    const virtualPath = assertSafeVaultPath(path);
    const resolved = resolve(this.root, virtualPath);
    const relation = relative(this.root, resolved);
    if (relation === '' || relation.startsWith(`..${sep}`) || relation === '..' || resolve(this.root, relation) !== resolved) {
      throw new Error(`Vault path escapes adapter root: ${path}`);
    }
    return resolved;
  }

  private async atomicWrite(path: string, content: string | Uint8Array): Promise<void> {
    const destination = this.resolvePath(path);
    await makeDirectory(dirname(destination), { recursive: true });
    const temporary = `${destination}.tmp-${randomUUID()}`;
    try {
      await writeFile(temporary, content);
      await rename(temporary, destination);
    } catch (error) {
      await rm(temporary, { force: true });
      throw error;
    }
  }

  private async collectFiles(absoluteDirectory: string, virtualDirectory: string, files: string[]): Promise<void> {
    for (const entry of await readdir(absoluteDirectory, { withFileTypes: true })) {
      const virtualPath = `${virtualDirectory}/${entry.name}`;
      const absolutePath = this.resolvePath(virtualPath);
      if (entry.isDirectory()) {
        await this.collectFiles(absolutePath, virtualPath, files);
      } else if (entry.isFile()) {
        files.push(virtualPath);
      }
    }
  }
}

function isNotFound(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
