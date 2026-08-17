import { mkdtemp, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NodeVaultAdapter } from '../../../src/infrastructure/vault/node-vault-adapter';

let root: string;
let adapter: NodeVaultAdapter;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'reading-improving-vault-'));
  adapter = new NodeVaultAdapter(root);
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe('NodeVaultAdapter', () => {
  it('creates parents and atomically writes/reads text files', async () => {
    await adapter.writeFile('LReading/Books/book_x/书籍.md', '# 示例书');

    await expect(adapter.readFile('LReading/Books/book_x/书籍.md')).resolves.toBe('# 示例书');
    await expect(adapter.exists('LReading/Books/book_x/书籍.md')).resolves.toBe(true);
  });

  it('appends lines and writes binary content under the virtual Vault path', async () => {
    await adapter.appendLine('LReading/.lreading/events.jsonl', '{"event":"one"}');
    await adapter.appendLine('LReading/.lreading/events.jsonl', '{"event":"two"}');
    await adapter.writeBinary('LReading/Books/book_x/assets/cover.bin', new Uint8Array([0, 1, 255]));

    await expect(adapter.readFile('LReading/.lreading/events.jsonl')).resolves.toBe(
      '{"event":"one"}\n{"event":"two"}\n',
    );
    await expect(readFile(join(root, 'LReading/Books/book_x/assets/cover.bin'))).resolves.toEqual(
      Buffer.from([0, 1, 255]),
    );
  });

  it('lists virtual file paths recursively and removes a file', async () => {
    await adapter.writeFile('LReading/Books/book_x/书籍.md', 'book');
    await adapter.writeFile('LReading/Books/book_x/chapters/001.md', 'chapter');

    await expect(adapter.listFiles('LReading/Books/book_x')).resolves.toEqual([
      'LReading/Books/book_x/chapters/001.md',
      'LReading/Books/book_x/书籍.md',
    ]);

    await adapter.remove('LReading/Books/book_x/书籍.md');
    await expect(adapter.exists('LReading/Books/book_x/书籍.md')).resolves.toBe(false);
  });

  it.each(['../outside.txt', '/tmp/outside.txt', 'C:\\outside.txt', 'LReading\\outside.txt'])(
    'rejects a path escape: %s',
    async (path) => {
      await expect(adapter.writeFile(path, 'must not write')).rejects.toThrow();
      await expect(stat(join(root, '..', 'outside.txt'))).rejects.toThrow();
    },
  );
});
