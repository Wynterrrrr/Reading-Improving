import { describe, expect, it } from 'vitest';
import { replaceSystemBlock, SystemBlockError } from '../../../src/domain/system-block';

const completeDocument = `# 书架

<!-- LREADING:SYSTEM-START -->
旧系统内容
<!-- LREADING:SYSTEM-END -->

<!-- LREADING:USER-START -->
用户写的中文观察。
<!-- LREADING:USER-END -->
`;

describe('system/user Markdown blocks', () => {
  it('replaces only the system block and preserves the user block byte-for-byte', () => {
    const result = replaceSystemBlock(completeDocument, '新系统内容\n- [[书籍]]');

    expect(result).toBe(`# 书架

<!-- LREADING:SYSTEM-START -->
新系统内容
- [[书籍]]
<!-- LREADING:SYSTEM-END -->

<!-- LREADING:USER-START -->
用户写的中文观察。
<!-- LREADING:USER-END -->
`);
  });

  it.each([
    '<!-- LREADING:SYSTEM-START -->\nonly start',
    '<!-- LREADING:SYSTEM-END -->\nonly end',
    '<!-- LREADING:SYSTEM-END -->\n<!-- LREADING:SYSTEM-START -->',
    '<!-- LREADING:SYSTEM-START -->\n<!-- LREADING:SYSTEM-START -->\n<!-- LREADING:SYSTEM-END -->',
    '<!-- LREADING:SYSTEM-START -->\n<!-- LREADING:USER-START -->\n<!-- LREADING:SYSTEM-END -->\n<!-- LREADING:USER-END -->',
  ])('rejects malformed or nested markers', (document) => {
    expect(() => replaceSystemBlock(document, 'replacement')).toThrow(SystemBlockError);
  });

  it('supports an empty user block without removing its markers', () => {
    const document = `<!-- LREADING:SYSTEM-START -->
old
<!-- LREADING:SYSTEM-END -->
<!-- LREADING:USER-START -->
<!-- LREADING:USER-END -->`;

    expect(replaceSystemBlock(document, 'new')).toContain(`<!-- LREADING:USER-START -->
<!-- LREADING:USER-END -->`);
  });
});
