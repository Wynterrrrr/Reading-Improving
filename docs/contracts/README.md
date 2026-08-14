# LReading 数据契约索引

<!-- LR-ANCHOR:CONTRACT-INDEX -->

本文件定义实现前必须遵守的最小数据不变量。第一阶段只建立工具链；具体 TypeScript/Zod schema 在对应阶段先写失败测试后再实现。任何字段扩展必须保持向后兼容，或者新建明确的迁移规则。

## 1. 通用约定

| 规则 | 要求 |
|---|---|
| 时间 | ISO-8601 UTC 字符串，例如 `2026-08-14T10:15:30.000Z` |
| ID | 小写 ASCII，稳定、不可由用户标题直接拼接；推荐 `book_<content-hash-prefix>`、`ch_<sequence>_<hash-prefix>`、`p_<sequence>_<hash-prefix>` |
| Vault 路径 | 相对于 Vault 根目录、`/` 分隔、不得含 `..`、不得是绝对路径 |
| 链接 | Vault 内部一律优先 `[[wikilink]]`；外部链接仅用于外部 URL |
| 用户文本 | 不作为 JSON 字段的唯一副本；Markdown 是权威保存位置 |
| 字符集 | UTF-8；文件名需安全 slug 并可保留人类可读标题 |

## 2. BookManifest（技术索引）

<!-- LR-CONTRACT:BOOK-MANIFEST -->

路径：`LReading/Books/<bookId>/.lreading/manifest.json`

```ts
interface BookManifest {
  schemaVersion: 1;
  bookId: string;
  title: string;
  creators: string[];
  language?: string;
  sourceHash: string;           // 原 EPUB bytes 的 SHA-256
  parserVersion: string;        // 导入器版本，不等同插件版本
  importedAt: string;           // ISO-8601
  chapterCount: number;
  assetCount: number;
  chapterPaths: string[];       // Vault 相对路径
  tocPath: string;
  bookNotePath: string;
  notesPath: string;
}
```

不变量：`bookId` 与目录一致；所有路径位于同一 `LReading/Books/<bookId>/` 前缀内；`sourceHash` 非空；章节列表无重复。

## 3. Chapter 与 Paragraph

<!-- LR-CONTRACT:SOURCE-LOCATION -->

章节 Markdown 最小 frontmatter：

```yaml
---
type: lreading-chapter
bookId: book_ab12cd34
book: "[[书籍]]"
chapterId: ch_001_ef56ab78
chapterIndex: 1
title: "第一章 示例"
sourceHref: "Text/chapter01.xhtml"
sourceHash: "<sha256>"
lreadingBookTags: [] # 仅可选批量物化命令管理；不替代用户 tags
---
```

每个可选择/可定位的正文段落或块必须有一条稳定 Obsidian block ID：

```markdown
这是从 EPUB 转换出的段落。 ^p_0001_a1b2c3d4
```

不变量：

- `paragraphId` 在同一 `sourceHash + chapterId` 内唯一；
- block ID 由代码生成，禁止由模型生成；
- block ID 不是裸序号，必须包含内容相关哈希以辅助重导入映射；
- 章节正文不能引用任何远程脚本或被执行的 HTML；
- 段落的可见原文不得被 AI 润色或删除。

## 4. SourceRef（笔记来源定位）

```ts
interface SourceRef {
  bookId: string;
  sourceHash: string;
  chapterId: string;
  chapterPath: string;          // Vault 相对路径
  paragraphId: string;          // 等于章节中的 block ID
  wikilink: string;             // 由系统组装，例如 [[章节#^p_xxx]]
  quoteSnapshot: string;        // 限长原文快照，便于人审查与重映射
  status: 'verified' | 'needs-review' | 'missing';
}
```

创建阅读记录时，`bookId/sourceHash/chapterId/chapterPath/paragraphId/wikilink` 必须由系统从活动章节解析并验证。用户只能编辑记录内容和可选标签，不能手填这些系统字段。

## 5. 阅读记录主文档

<!-- LR-CONTRACT:READING-NOTES -->

路径：`LReading/Books/<bookId>/阅读笔记与摘要.md`

固定 frontmatter：

```yaml
---
type: lreading-reading-notes
bookId: book_ab12cd34
book: "[[书籍]]"
created: 2026-08-14T10:15:30.000Z
updated: 2026-08-14T10:15:30.000Z
---
```

一条记录的 Markdown 格式：

```markdown
<!-- LREADING:RECORD id=rr_... -->
### 2026-08-14 18:20｜阅读笔记

- 类型：`note`
- 证据状态：`personal-understanding`
- 位置：[[章节#^p_0001_a1b2c3d4]]
- 原文摘录：> 不超过配置长度的 quoteSnapshot
- 书籍标签：#book/example
- 记录标签：#lreading/note

我的理解正文。
<!-- LREADING:RECORD-END -->
```

允许 `type`：`quote`、`note`、`summary`、`question`、`review`、`insight`。

允许 `evidenceStatus`：`source-backed`、`personal-understanding`、`inference`、`unresolved`、`personal-association`。

不变量：记录只允许**追加**，不得重导入覆盖；所有 `source-backed` 记录必须有 `status=verified` 的 SourceRef；`question` 可以无选区，但必须含 book 关联。

## 6. 书籍首页与书籍标签

<!-- LR-CONTRACT:BOOK-TAGS -->

路径：`LReading/Books/<bookId>/书籍.md`

```yaml
---
type: lreading-book
bookId: book_ab12cd34
title: "书名"
creators: []
tags:
  - book/example
  - reading/in-progress
lreadingBookTags:
  - book/example
  - reading/in-progress
sourceHash: "<sha256>"
---
```

- `tags` 是 Obsidian 原生、用户可编辑的标签集合。
- `lreadingBookTags` 是插件最近一次明确设置的书籍标签集合，供合并、预览、撤销和可选批量物化使用。
- 设置书籍标签不得删除用户手工新增、且不在旧 `lreadingBookTags` 中的 `tags`。
- 默认不修改章节和阅读记录的 `tags`；它们通过 `book` 属性关联本书。

## 7. 系统区块边界

可重建的 `书架.md`、`书籍.md`、`目录.md` 必须以如下标记划分系统与用户区：

```markdown
<!-- LREADING:SYSTEM-START -->
插件可更新内容
<!-- LREADING:SYSTEM-END -->

<!-- LREADING:USER-START -->
用户手写内容，插件永不覆盖。
<!-- LREADING:USER-END -->
```

若标记缺失、嵌套、顺序错误或有重复，插件必须停止覆盖并提示用户修复/恢复，不能猜测文本范围。

## 8. ReimportDecision（重导入决策）

```ts
type ReimportDecision =
  | { kind: 'skip-identical' }
  | { kind: 'import-as-new-book' }
  | { kind: 'update-derived-content'; requireBackup: true };
```

不同 `sourceHash` 时，必须由用户在预览中选择后才写入。`update-derived-content` 只能更新可重建内容，并生成映射报告；无法确认的旧 SourceRef 状态必须变成 `needs-review`，不允许改成别的有效段落。

## 9. 明确不存在的契约

- 没有 `数据摘要.md`、`DataSummary`、或以统计报告作为用户知识来源的对象。
- 第一版没有 LLM 输出契约、向量索引契约、云同步契约、用户帐户契约。
- 后续阶段新增 AI 契约前必须先扩展本文件，并写入明确的来源、草稿、预览、确认和撤销规则。
