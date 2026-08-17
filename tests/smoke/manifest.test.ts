import { describe, expect, it } from 'vitest';
import manifest from '../../manifest.json';
import versions from '../../versions.json';

describe('Obsidian plugin manifest', () => {
  it('declares the stable plugin identity and required metadata', () => {
    expect(manifest.id).toBe('lreading');
    expect(manifest.name).toBe('Reading Improving');
    expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.minAppVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(manifest.description).toContain('EPUB');
    expect(manifest.author).toBeTruthy();
    expect(manifest.isDesktopOnly).toBe(true);
  });

  it('keeps the Obsidian versions map synchronized with the manifest', () => {
    expect(versions[manifest.version as keyof typeof versions]).toBe(manifest.minAppVersion);
  });
});
