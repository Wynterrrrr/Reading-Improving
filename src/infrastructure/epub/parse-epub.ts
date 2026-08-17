import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { parseHTML } from 'linkedom';
import type {
  NormalizedAsset,
  NormalizedBook,
  NormalizedChapter,
  NormalizedTocNode,
} from '../../domain/epub-normalize';
import { inspectZipSafety } from './zip-safety';

export type EpubParseErrorCode =
  | 'not_zip'
  | 'no_container'
  | 'no_opf'
  | 'drm_encrypted'
  | 'invalid_container'
  | 'invalid_package'
  | 'missing_spine_item'
  | 'empty_book';

export class EpubParseError extends Error {
  constructor(
    public readonly code: EpubParseErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'EpubParseError';
  }
}

export interface ParseEpubOptions {
  parserVersion: string;
}

interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
  properties: string;
}

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
});

export function parseEpub(bytes: Uint8Array, options: ParseEpubOptions): NormalizedBook {
  let entries: Record<string, Uint8Array>;
  try {
    inspectZipSafety(bytes);
    entries = unzipSync(bytes);
  } catch (error) {
    if (error instanceof EpubParseError) {
      throw error;
    }
    throw new EpubParseError('not_zip', 'EPUB is not a valid ZIP archive');
  }

  if ('META-INF/encryption.xml' in entries) {
    throw new EpubParseError('drm_encrypted', 'Encrypted EPUB files are not supported');
  }

  const containerXml = readTextEntry(entries, 'META-INF/container.xml');
  if (!containerXml) {
    throw new EpubParseError('no_container', 'EPUB container.xml is missing');
  }
  const opfPath = parseContainer(containerXml);
  const opfXml = readTextEntry(entries, opfPath);
  if (!opfXml) {
    throw new EpubParseError('no_opf', 'EPUB package document is missing');
  }

  const packageData = parsePackage(opfXml, opfPath);
  const chapters: NormalizedChapter[] = [];
  const warnings: string[] = [];

  for (const [spineIndex, itemId] of packageData.spine.entries()) {
    const item = packageData.manifest.get(itemId);
    if (!item) {
      warnings.push(`Missing manifest item for spine reference: ${itemId}`);
      continue;
    }
    const sourceHref = resolveEpubHref(opfPath, item.href);
    const xhtml = readTextEntry(entries, sourceHref);
    if (!xhtml) {
      warnings.push(`Missing spine file: ${sourceHref}`);
      continue;
    }
    chapters.push({
      sourceHref,
      spineIndex,
      title: extractChapterTitle(xhtml, spineIndex),
      safeXhtml: sanitizeXhtml(xhtml),
    });
  }

  if (chapters.length === 0) {
    throw new EpubParseError('empty_book', 'EPUB has no readable spine chapters');
  }

  const navItem = [...packageData.manifest.values()].find((item) => item.properties.split(/\s+/).includes('nav'));
  const ncxItem = [...packageData.manifest.values()].find((item) => item.mediaType === 'application/x-dtbncx+xml');
  const toc = navItem
    ? parseNavToc(readTextEntry(entries, resolveEpubHref(opfPath, navItem.href)), resolveEpubHref(opfPath, navItem.href))
    : ncxItem
      ? parseNcxToc(readTextEntry(entries, resolveEpubHref(opfPath, ncxItem.href)), resolveEpubHref(opfPath, ncxItem.href))
      : [];
  const assets: NormalizedAsset[] = [...packageData.manifest.values()]
    .filter((item) => item.mediaType.startsWith('image/'))
    .map((item) => ({ href: resolveEpubHref(opfPath, item.href), mediaType: item.mediaType }))
    .sort((left, right) => left.href.localeCompare(right.href));

  return {
    sourceHash: createHash('sha256').update(bytes).digest('hex'),
    parserVersion: options.parserVersion,
    metadata: packageData.metadata,
    chapters,
    toc,
    assets,
    warnings,
  };
}

function readTextEntry(entries: Record<string, Uint8Array>, path: string): string | null {
  const entry = entries[path];
  return entry ? new TextDecoder().decode(entry) : null;
}

function parseContainer(xml: string): string {
  const parsed = parseXml(xml, 'invalid_container');
  const containerNode = asRecord(parsed.container);
  const rootfilesNode = asRecord(containerNode?.rootfiles);
  const rootfile = first(asArray(rootfilesNode?.rootfile));
  const fullPath = attribute(rootfile, 'full-path');
  if (!fullPath) {
    throw new EpubParseError('invalid_container', 'EPUB container.xml does not declare a package path');
  }
  return normalizeEpubPath(fullPath);
}

function parsePackage(xml: string, opfPath: string): {
  metadata: { title: string; creators: string[]; language?: string };
  manifest: Map<string, ManifestItem>;
  spine: string[];
} {
  const parsed = parseXml(xml, 'invalid_package');
  const packageNode = asRecord(parsed.package);
  if (!packageNode) {
    throw new EpubParseError('invalid_package', 'EPUB package document has no package root');
  }

  const metadata = asRecord(packageNode.metadata);
  const manifestNode = asRecord(packageNode.manifest);
  const spineNode = asRecord(packageNode.spine);
  const title = textValue(metadata?.['dc:title']) || textValue(metadata?.title);
  if (!title) {
    throw new EpubParseError('invalid_package', 'EPUB package metadata has no title');
  }
  const creators = asValueArray(metadata?.['dc:creator'] ?? metadata?.creator)
    .map(textValue)
    .filter((value): value is string => Boolean(value));
  const language = textValue(metadata?.['dc:language'] ?? metadata?.language);

  const manifest = new Map<string, ManifestItem>();
  for (const rawItem of asArray(manifestNode?.item)) {
    const id = attribute(rawItem, 'id');
    const href = attribute(rawItem, 'href');
    const mediaType = attribute(rawItem, 'media-type');
    if (!id || !href || !mediaType) {
      throw new EpubParseError('invalid_package', 'EPUB manifest item is incomplete');
    }
    manifest.set(id, {
      id,
      href,
      mediaType,
      properties: attribute(rawItem, 'properties') ?? '',
    });
  }
  if (manifest.size === 0) {
    throw new EpubParseError('invalid_package', 'EPUB package manifest is empty');
  }

  const spine = asArray(spineNode?.itemref)
    .map((item) => attribute(item, 'idref'))
    .filter((value): value is string => Boolean(value));
  if (spine.length === 0) {
    throw new EpubParseError('empty_book', 'EPUB package spine is empty');
  }

  // Resolve once here to reject malformed OPF-relative hrefs before XHTML is read.
  for (const item of manifest.values()) {
    resolveEpubHref(opfPath, item.href);
  }

  return { metadata: { title, creators, language }, manifest, spine };
}

function parseNavToc(navXml: string | null, navPath: string): NormalizedTocNode[] {
  if (!navXml) {
    return [];
  }
  const { document } = parseHTML(navXml);
  const nav = Array.from(document.querySelectorAll('nav')).find((element) => element.getAttribute('epub:type') === 'toc');
  const list = nav?.querySelector('ol');
  return list ? tocChildren(list, navPath) : [];
}

function tocChildren(list: Element, navPath: string): NormalizedTocNode[] {
  return Array.from(list.children)
    .filter((element) => element.tagName.toLowerCase() === 'li')
    .flatMap((item) => {
      const anchor = Array.from(item.children).find((element) => element.tagName.toLowerCase() === 'a');
      if (!anchor) {
        return [];
      }
      const nested = Array.from(item.children).find((element) => element.tagName.toLowerCase() === 'ol');
      const rawHref = anchor.getAttribute('href');
      return [{
        title: anchor.textContent.trim(),
        href: rawHref ? resolveEpubHref(navPath, rawHref) : '',
        children: nested ? tocChildren(nested, navPath) : [],
      }];
    });
}

function parseNcxToc(ncxXml: string | null, ncxPath: string): NormalizedTocNode[] {
  if (!ncxXml) {
    return [];
  }
  const parsed = parseXml(ncxXml, 'invalid_package');
  const ncx = asRecord(parsed.ncx);
  const navMap = asRecord(ncx?.navMap);
  return ncxChildren(asArray(navMap?.navPoint), ncxPath);
}

function ncxChildren(points: Record<string, unknown>[], ncxPath: string): NormalizedTocNode[] {
  return points.flatMap((point) => {
    const label = asRecord(point.navLabel);
    const content = asRecord(point.content);
    const title = textValue(label?.text);
    const rawHref = attribute(content, 'src');
    if (!title || !rawHref) {
      return [];
    }
    return [{
      title,
      href: resolveEpubHref(ncxPath, rawHref),
      children: ncxChildren(asArray(point.navPoint), ncxPath),
    }];
  });
}

function sanitizeXhtml(xhtml: string): string {
  const { document } = parseHTML(xhtml);
  for (const element of Array.from(document.querySelectorAll('script, style, noscript, iframe, object, embed'))) {
    element.remove();
  }
  for (const element of Array.from(document.querySelectorAll('*'))) {
    for (const attributeName of element.getAttributeNames()) {
      const value = element.getAttribute(attributeName) ?? '';
      if (attributeName.toLowerCase().startsWith('on') || isRemoteUrl(value)) {
        element.removeAttribute(attributeName);
      }
    }
  }
  return document.body.innerHTML.trim();
}

function extractChapterTitle(xhtml: string, spineIndex: number): string {
  const { document } = parseHTML(xhtml);
  const heading = document.querySelector('h1, h2, h3, h4, h5, h6');
  return heading?.textContent.trim() || `第 ${spineIndex + 1} 章`;
}

function isRemoteUrl(value: string): boolean {
  return /^(?:https?:|data:|javascript:)/i.test(value.trim());
}

function parseXml(xml: string, code: 'invalid_container' | 'invalid_package'): Record<string, unknown> {
  if (XMLValidator.validate(xml) !== true) {
    throw new EpubParseError(code, code === 'invalid_container' ? 'EPUB container.xml is invalid' : 'EPUB package document is invalid');
  }
  return xmlParser.parse(xml) as Record<string, unknown>;
}

function asValueArray(value: unknown): unknown[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function asArray(value: unknown): Record<string, unknown>[] {
  return asValueArray(value).filter(isRecord);
}

function first(values: Record<string, unknown>[]): Record<string, unknown> | undefined {
  return values[0];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return isRecord(value) ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function attribute(node: Record<string, unknown> | undefined, name: string): string | undefined {
  const value = node?.[`@_${name}`];
  return typeof value === 'string' ? value : undefined;
}

function textValue(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }
  if (isRecord(value) && typeof value['#text'] === 'string' && value['#text'].trim()) {
    return value['#text'].trim();
  }
  return undefined;
}

function resolveEpubHref(basePath: string, href: string): string {
  const [rawPath, fragment] = href.split('#', 2);
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(rawPath)) {
    throw new EpubParseError('invalid_package', 'EPUB package contains an external resource reference');
  }
  const directory = basePath.includes('/') ? basePath.slice(0, basePath.lastIndexOf('/')) : '';
  const topLevelDirectory = directory.split('/')[0] ?? '';
  const alreadyArchiveRelative = topLevelDirectory.length > 0 && (rawPath === topLevelDirectory || rawPath.startsWith(`${topLevelDirectory}/`));
  const joined = rawPath.startsWith('/')
    ? rawPath.slice(1)
    : rawPath
      ? alreadyArchiveRelative
        ? rawPath
        : `${directory}/${rawPath}`
      : basePath;
  const normalized = normalizeEpubPath(joined);
  return fragment ? `${normalized}#${fragment}` : normalized;
}

function normalizeEpubPath(path: string): string {
  const segments: string[] = [];
  for (const segment of path.split('/')) {
    if (!segment || segment === '.') {
      continue;
    }
    if (segment === '..') {
      if (segments.length === 0) {
        throw new EpubParseError('invalid_package', 'EPUB resource path escapes its archive root');
      }
      segments.pop();
      continue;
    }
    if (segment.includes('\\')) {
      throw new EpubParseError('invalid_package', 'EPUB resource path uses an invalid separator');
    }
    segments.push(segment);
  }
  if (segments.length === 0) {
    throw new EpubParseError('invalid_package', 'EPUB resource path is empty');
  }
  return segments.join('/');
}
