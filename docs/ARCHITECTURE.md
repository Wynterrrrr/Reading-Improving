# LReading 架构

<!-- LR-ANCHOR:ARCHITECTURE -->

## 1. 架构目标

构建一个 Obsidian 桌面端插件，用**确定性代码**将无 DRM EPUB 转换为可阅读、可链接、可重导入的 Markdown。用户可以在章节中选区，写入带可验证位置的摘录、笔记、摘要与问题。用户资产以 Markdown 保留在 Vault，插件只是解析、索引、导航和受控写入的协调者。

## 2. 分层与依赖方向

```text
┌────────────────────────────────────────────────────────────┐
│ Obsidian UI Layer                                           │
│ 命令、导入 Modal、目录/资料视图、选区动作、Notice            │
├────────────────────────────────────────────────────────────┤
│ Application Layer                                           │
│ ImportBook、CreateReadingRecord、SetBookTags、ReimportBook  │
├────────────────────────────────────────────────────────────┤
│ Domain Layer (pure TypeScript)                              │
│ Book / Chapter / Paragraph / SourceRef / ReadingRecord      │
│ EPUB 规范化、Markdown 渲染、标签合并、重导入决策             │
├────────────────────────────────────────────────────────────┤
│ Infrastructure Layer                                        │
│ Obsidian Vault Adapter、ZIP/XML/HTML parser、文件选择器     │
└────────────────────────────────────────────────────────────┘
```

依赖只能从上向下。`domain/` 不得 import `obsidian`、Electron、DOM 或 Node 文件系统；它必须能在 Vitest Node 环境中独立测试。

<!-- LR-DECISION-01 -->

### LR-DECISION-01：Markdown-first，索引可重建

- **决定**：章节正文、书籍首页、目录、书架和阅读笔记均为 Markdown；轻量 JSON/JSONL 仅保存可从 Markdown/导入源重建的加速索引或导入 manifest。
- **理由**：用户可脱离插件继续读写、使用原生链接/搜索/Bases/Graph；不把知识锁进插件私有数据库。
- **后果**：索引损坏可重建；不得让 JSON 成为笔记或标签的唯一来源。

<!-- LR-DECISION-02 -->

### LR-DECISION-02：EPUB 转换完全由代码承担

- **决定**：EPUB ZIP/XML/XHTML 解析、章节分割、图像提取、Markdown 渲染、段落块 ID、目录生成全由本地代码实现。
- **理由**：保证可复现、可测试、节省模型成本、不把整本版权内容发送到 API、确保笔记定位可靠。
- **后果**：复杂表格、MathML、SVG 必须定义确定性降级，不允许模型“猜测转换”。

<!-- LR-DECISION-03 -->

### LR-DECISION-03：来源定位为复合引用，不使用页码

一个有效 `SourceRef` 同时包含：

```text
bookId + chapterId + paragraphId/blockId + chapterPath + quoteSnapshot + sourceHash
```

Markdown 中的链接以 `[[章节路径#^block-id]]` 展示，运行时再由 manifest 验证 `bookId/sourceHash`。EPUB 页码、裸字符偏移、模型给的位置不得作为真实定位。

<!-- LR-DECISION-04 -->

### LR-DECISION-04：用户数据与导入派生文件分离

- 允许重建：`chapters/`、`assets/`、技术索引、系统生成区块。
- 不可被重导入覆盖：`阅读笔记与摘要.md` 及用户编辑区。
- `书籍.md`、`目录.md`、`书架.md` 使用明确的系统区块边界，只更新系统块，保留用户块。

<!-- LR-DECISION-05 -->

### LR-DECISION-05：书籍级标签默认语义继承

书籍标签只保存到 `书籍.md` 的 `tags`；章节和阅读记录用 `book: "[[书籍]]"` 建立关系。资料目录聚合显示标签，不默认把标签文本复制到每篇章节和每条笔记。可选“批量物化”须预览变更，并只管理 `lreadingBookTags` 属性，永不覆写用户 `tags`。

<!-- LR-DECISION-06 -->

### LR-DECISION-06：没有数据摘要 Markdown

系统不创建 `数据摘要.md`。章节数、笔记数、导入版本、最近阅读位置等属于可重建状态，由内部索引和后续资料目录视图显示。理由：避免出现与真实 Vault 内容漂移的第二份可编辑数据源。

## 3. 运行时 Vault 布局

```text
LReading/
├── 书架.md
└── Books/
    └── <bookId>/
        ├── 书籍.md
        ├── 目录.md
        ├── 阅读笔记与摘要.md
        ├── .lreading/
        │   ├── manifest.json
        │   ├── toc.json
        │   └── import-state.json
        ├── source/
        │   └── original.epub              # 可选；默认由设置决定是否保留
        ├── chapters/
        │   ├── 001-<slug>.md
        │   └── ...
        └── assets/
            └── <content-hash>.<extension>
```

### 文件职责

| 文件 | 职责 | 可否重建 | 用户可编辑区 |
|---|---|---:|---|
| `书架.md` | 全局书入口 | 是 | `<!-- LREADING:USER-START/END -->` 内 |
| `书籍.md` | 书籍元信息、标签、书级入口 | 部分 | 用户区 + 用户自定义 tags |
| `目录.md` | 本书章节导航 | 是 | 用户区 |
| `阅读笔记与摘要.md` | 摘录/笔记/摘要/问题时间线 | 否 | 除受控追加点外全部归用户 |
| `chapters/*.md` | 从 EPUB 生成的原文 | 是 | frontmatter 的用户 tags 仅可合并保留 |
| `assets/*` | 从 EPUB 提取的资源 | 是 | 否 |
| `.lreading/*.json` | 可重建技术索引与导入状态 | 是 | 否 |

## 4. 核心数据流

### 4.1 导入

```text
用户选择文件
→ UI 校验扩展名/大小/取消
→ ZIP 安全检查（路径、条目数、未压缩总量）
→ container.xml → OPF → manifest/spine/TOC
→ XHTML 解析为 NormalizedBook（纯领域数据）
→ 确定性 Markdown 渲染 + paragraph block IDs
→ 导入预览（书名、章节、资源、覆盖影响）
→ 用户确认
→ 原子写入 Vault（派生文件）
→ 写入/更新书籍入口、目录、书架、技术 manifest
```

### 4.2 阅读记录

```text
用户在已导入章节选择原文
→ 从章节 frontmatter + block ID 验证定位
→ 用户选择记录类型（摘录 / 笔记 / 摘要 / 问题）并编辑内容
→ 预览即将追加的 Markdown
→ 用户确认
→ 原子追加至 阅读笔记与摘要.md
→ 资料目录索引刷新（后续）
```

### 4.3 重导入

```text
新 EPUB → sourceHash 比对
  ├─ 相同：不重复写入
  ├─ 不同 + 用户选择“新书”：生成新 bookId
  └─ 不同 + 用户选择“更新正文”：
        备份派生正文/索引
        → 映射旧 paragraphId
        → 能映射：保留引用
        → 不能映射：标为 needs-review，绝不静默指错
        → 不改 阅读笔记与摘要.md 的用户正文
```

## 5. 目录级模块边界（拟定）

```text
src/
├── main.ts                         # 插件组装，不放业务规则
├── domain/                         # 纯函数、Zod/类型、无 Obsidian import
│   ├── book.ts
│   ├── source-ref.ts
│   ├── reading-record.ts
│   ├── tags.ts
│   ├── epub-normalize.ts
│   ├── markdown-render.ts
│   └── reimport.ts
├── application/                    # use cases 与 ports
│   ├── import-book.ts
│   ├── create-reading-record.ts
│   ├── set-book-tags.ts
│   └── reimport-book.ts
├── infrastructure/                 # ZIP/XML/HTML/Obsidian 适配器
│   ├── epub/
│   └── vault/
└── ui/                             # Obsidian 命令、Modal、ItemView、CSS 类
    ├── commands.ts
    ├── import-modal.ts
    ├── reading-record-modal.ts
    └── library-view.ts
```

## 6. 风险与应对

<!-- LR-RISK-01 -->

| 风险 | 严重度 | 预防 / 验收 |
|---|---:|---|
| EPUB 差异大，转换不完整 | 高 | 先定义语义保真范围；fixture 覆盖标准和异常 XHTML；生成 conversion warnings |
| ZIP 炸弹、路径穿越、恶意 XHTML | 高 | 限制条目数/未压缩体积；拒绝 `..`/绝对路径；不执行脚本/远程资源；安全测试 |
| 重导入让笔记回链错误 | 高 | sourceHash + 备份 + 显式映射状态；无法匹配时标 `needs-review` |
| 批量标签覆盖用户标签 | 高 | 系统标签使用独立 `lreadingBookTags`；合并而非覆盖；预览测试 |
| Obsidian 虚拟路径误当作绝对路径 | 高 | Vault Adapter 唯一处理路径；纯函数只使用相对 `/` 路径；真实 adapter 测试 |
| 用户笔记被重新导入覆盖 | 高 | 用户笔记和派生正文分目录；写入白名单；回归测试 |
| 复杂表格/公式损坏书意 | 中 | 保留可读降级和 warning；不让模型润色或补全 |
| 大文件性能差 | 中 | 流式/分章节解析，配置上限，后续 benchmark；MVP 不做全书模型处理 |
| 插件 UI 与深色主题不兼容 | 中 | 全部 CSS 用 Obsidian variables；手工深/浅主题验收 |
| 版权/隐私泄漏到仓库或日志 | 高 | 不提交真实 EPUB、导入书、测试书内容或 API Key；release scan |

## 7. 后续智能阶段的边界（LR-PHASE-11）

在 `LR-PHASE-10` 的真实闭环验收完成前，禁止实现。

届时流程必须是：小范围读取书名/元数据/目录/前言/章节采样 → 显示候选书籍类型和理由 → 用户可修改 → 按多个分析模块生成可回链草稿 → 用户确认后写入 Markdown。书名本身只能作为弱线索；一本书可组合多个分析模块，例如经济史可同时生成时间线、制度变迁、因果链和争议证据。
