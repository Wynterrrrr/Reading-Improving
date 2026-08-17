export interface NormalizedBookMetadata {
  title: string;
  creators: string[];
  language?: string;
}

export interface NormalizedChapter {
  sourceHref: string;
  spineIndex: number;
  title: string;
  safeXhtml: string;
}

export interface NormalizedTocNode {
  title: string;
  href: string;
  children: NormalizedTocNode[];
}

export interface NormalizedAsset {
  href: string;
  mediaType: string;
}

export interface NormalizedBook {
  sourceHash: string;
  parserVersion: string;
  metadata: NormalizedBookMetadata;
  chapters: NormalizedChapter[];
  toc: NormalizedTocNode[];
  assets: NormalizedAsset[];
  warnings: string[];
}
