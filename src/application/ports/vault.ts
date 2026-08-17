export interface VaultAdapter {
  readFile(path: string): Promise<string | null>;
  writeFile(path: string, content: string): Promise<void>;
  writeBinary(path: string, content: Uint8Array): Promise<void>;
  appendLine(path: string, line: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  listFiles(directory: string): Promise<string[]>;
  mkdir(directory: string): Promise<void>;
  remove(path: string): Promise<void>;
}
