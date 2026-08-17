import { strToU8, zipSync } from 'fflate';

const container = (fullPath: string): string => `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="${fullPath}" media-type="application/oebps-package+xml"/></rootfiles>
</container>`;

const packageDocument = (extraSpine = ''): string => `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="book-id">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="book-id">fixture-book</dc:identifier>
    <dc:title>合成阅读测试书</dc:title>
    <dc:creator>测试作者</dc:creator>
    <dc:language>zh-CN</dc:language>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="chapter-two" href="chapters/two.xhtml" media-type="application/xhtml+xml"/>
    <item id="chapter-one" href="chapters/one.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover" href="images/cover.bin" media-type="image/png"/>
  </manifest>
  <spine>
    <itemref idref="chapter-one"/>
    <itemref idref="chapter-two"/>
    ${extraSpine}
  </spine>
</package>`;

const navigation = `<!doctype html><html xmlns:epub="http://www.idpf.org/2007/ops"><body>
<nav epub:type="toc"><ol>
  <li><a href="chapters/one.xhtml#start">第一章</a><ol><li><a href="chapters/one.xhtml#detail">第一章细节</a></li></ol></li>
  <li><a href="chapters/two.xhtml">第二章</a></li>
</ol></nav>
</body></html>`;

const chapterOne = `<!doctype html><html><head><title>第一章</title><script>window.bad = true</script></head><body>
<h1 id="start">第一章</h1><p id="detail" onclick="alert('bad')">合成第一段。</p>
<p><a href="https://example.invalid/remote">远程链接</a><img src="https://example.invalid/image.png"/></p>
<iframe src="https://example.invalid/frame"></iframe>
</body></html>`;

const chapterTwo = `<!doctype html><html><body><h2>第二章</h2><p>合成第二段。</p></body></html>`;

export function makeValidEpub(): Uint8Array {
  return zipSync({
    mimetype: strToU8('application/epub+zip'),
    'META-INF/container.xml': strToU8(container('OPS/package.opf')),
    'OPS/package.opf': strToU8(packageDocument()),
    'OPS/nav.xhtml': strToU8(navigation),
    'OPS/chapters/one.xhtml': strToU8(chapterOne),
    'OPS/chapters/two.xhtml': strToU8(chapterTwo),
    'OPS/images/cover.bin': new Uint8Array([137, 80, 78, 71]),
  });
}

export function makeEpubWithNcxOnly(): Uint8Array {
  const ncxOnlyPackage = packageDocument()
    .replace('    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>\n', '')
    .replace('    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n', '');
  const ncx = `<?xml version="1.0"?><ncx><navMap>
    <navPoint id="one"><navLabel><text>NCX 第一章</text></navLabel><content src="OPS/chapters/one.xhtml#start"/></navPoint>
    <navPoint id="two"><navLabel><text>NCX 第二章</text></navLabel><content src="OPS/chapters/two.xhtml"/></navPoint>
  </navMap></ncx>`;
  return zipSync({
    mimetype: strToU8('application/epub+zip'),
    'META-INF/container.xml': strToU8(container('OPS/package.opf')),
    'OPS/package.opf': strToU8(ncxOnlyPackage.replace('<manifest>', '<manifest>\n    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>')),
    'OPS/toc.ncx': strToU8(ncx),
    'OPS/chapters/one.xhtml': strToU8(chapterOne),
    'OPS/chapters/two.xhtml': strToU8(chapterTwo),
  });
}

export function makeZipWithoutContainer(): Uint8Array {
  return zipSync({ 'OPS/package.opf': strToU8(packageDocument()) });
}

export function makeZipWithMissingOpf(): Uint8Array {
  return zipSync({ 'META-INF/container.xml': strToU8(container('OPS/missing.opf')) });
}

export function makeZipWithDrmMarker(): Uint8Array {
  return zipSync({
    'META-INF/container.xml': strToU8(container('OPS/package.opf')),
    'META-INF/encryption.xml': strToU8('<encryption/>'),
    'OPS/package.opf': strToU8(packageDocument()),
  });
}

export function makeZipWithMissingSpineItem(): Uint8Array {
  return zipSync({
    'META-INF/container.xml': strToU8(container('OPS/package.opf')),
    'OPS/package.opf': strToU8(packageDocument('<itemref idref="ghost"/>')),
    'OPS/nav.xhtml': strToU8(navigation),
    'OPS/chapters/one.xhtml': strToU8(chapterOne),
    'OPS/chapters/two.xhtml': strToU8(chapterTwo),
  });
}

export function makeZipWithMalformedOpf(): Uint8Array {
  return zipSync({
    'META-INF/container.xml': strToU8(container('OPS/package.opf')),
    'OPS/package.opf': strToU8('<package><metadata></package>'),
  });
}
