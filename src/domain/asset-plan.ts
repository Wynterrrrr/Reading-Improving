import { createBytesHash } from './block-id';

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
};

export interface AssetInput {
  href: string;
  mediaType: string;
  content?: Uint8Array;
}

export interface AssetWritePlanEntry {
  href: string;
  mediaType: string;
  path: string;
  content: Uint8Array;
}

export interface AssetWritePlan {
  assets: AssetWritePlanEntry[];
  warnings: string[];
}

export function createAssetWritePlan(bookId: string, inputs: AssetInput[]): AssetWritePlan {
  const assets: AssetWritePlanEntry[] = [];
  const warnings: string[] = [];
  const seenHashes = new Set<string>();

  for (const input of inputs) {
    const extension = EXTENSIONS[input.mediaType];
    if (!extension) {
      warnings.push(`Unsupported asset media type skipped: ${input.mediaType}`);
      continue;
    }
    if (!input.content || input.content.byteLength === 0) {
      warnings.push(`Missing asset payload: ${input.href}`);
      continue;
    }
    const hash = createBytesHash(input.content);
    if (seenHashes.has(hash)) {
      continue;
    }
    seenHashes.add(hash);
    assets.push({
      href: input.href,
      mediaType: input.mediaType,
      path: `LReading/Books/${bookId}/assets/${hash}.${extension}`,
      content: input.content,
    });
  }

  return { assets, warnings };
}
