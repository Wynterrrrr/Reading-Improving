# Reading Improving / LReading

> 面向 Obsidian 的本地优先阅读学习插件：将**无 DRM EPUB**转换为便于阅读、稳定可回链的 Markdown；在阅读中记录摘录、笔记、摘要和问题；让这些记录成为用户长期拥有的 Obsidian 知识资产。

<!-- LR-ANCHOR:PROJECT-ENTRY -->

## 当前状态

- 状态：**仅完成项目骨架与施工文档；未安装依赖、未创建业务代码、未开始插件实现。**
- 当前可施工阶段：`LR-PHASE-01`（须由用户明确授权后执行）。
- 唯一施工方案：[docs/CONSTRUCTION_PLAN.md](docs/CONSTRUCTION_PLAN.md)
- 当前账本：[docs/STATUS.md](docs/STATUS.md)
- 任何 Agent 开始工作前必须先阅读 [AGENTS.md](AGENTS.md)。

## 用户问题与产品闭环

LReading 的最小正确闭环是：

```text
选择无 DRM EPUB
  → 代码解析并生成整洁的章节 Markdown
  → 在 Obsidian 中阅读、目录跳转、查看本地图片
  → 选中原文，创建摘录 / 笔记 / 摘要 / 问题
  → 记录带稳定原文位置，可从笔记跳回章节段落
  → 后续通过书架、资料目录、标签、链接与搜索找到它
```

**第一版首先解决上述闭环。** 不以“生成很多 AI 摘要”代替真实阅读，也不以专属 UI 替代 Obsidian 原生 Markdown、链接、搜索、标签、Backlinks 或 Graph。

## 设计原则（已确认）

1. **Markdown-first**：用户阅读、笔记、摘要、问题和复盘以 Vault 中可读 Markdown 保存。JSON/JSONL 只可作为插件可重建的技术索引，不能成为用户知识唯一来源。
2. **代码负责转换，模型负责理解**：EPUB 到 Markdown、目录、资源提取、锚点和定位全部由确定性代码完成；大模型不改写原书正文。
3. **稳定定位优先**：笔记位置用 `bookId + chapterId + paragraph/blockId + quoteSnapshot` 表示，不使用 EPUB 页码、字符偏移或模型猜测的位置。
4. **用户文本不可静默覆盖**：导入生成的正文与用户写的笔记分目录保存；重导入只能更新允许更新的派生内容，并在可能影响回链时预览和确认。
5. **标签语义同步，不默认文本复制**：书籍标签存于 `书籍.md`；章节和笔记通过 `book: "[[书籍]]"` 关联书籍。将书籍标签实际写入全部章节是可选操作，不是默认行为。
6. **一本书一份阅读记录主文档**：`阅读笔记与摘要.md` 是快速记录和时间线；高价值内容可在未来“升级”为跨书独立知识笔记，但不强迫每条记录拆文件。
7. **没有 `数据摘要.md`**：统计信息不产生第二份 Markdown 真相来源。可重建统计仅显示在后续插件资料目录视图或由内部索引计算。
8. **先本地、后智能**：不引入账号系统、云后端、向量数据库或自动全书 AI 分析。书籍类型识别、时间线、概念/论证结构等属于后续受控阶段。

完整架构、风险和决策见 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)。

## 目标 Vault 产物（运行时，不是本仓库的源码目录）

```text
<Obsidian Vault>/
└── LReading/
    ├── 书架.md                         # 插件可重建的总入口
    └── Books/
        └── <bookId>/
            ├── 书籍.md                 # 本书首页：元信息、书籍级 tags、入口
            ├── 目录.md                 # 可点击章节目录
            ├── 阅读笔记与摘要.md       # 用户阅读记录主文档
            ├── source/                 # 原 EPUB（可选保留；默认 gitignore）
            ├── chapters/               # 导入生成正文；每段有稳定块 ID
            └── assets/                 # 从 EPUB 提取的本地图片/资源
```

> `source/`、`chapters/`、`assets/` 和技术索引均不得被 GitHub 源码仓库提交。用户笔记也默认不随插件源码仓库提交；是否同步由用户自己的 Vault 同步策略决定。

## 明确不做（第一版边界）

- 不破解、绕过或导入 DRM EPUB。
- 不承诺出版排版像素级复刻；目标是语义、结构、可读性和可回链。
- 不执行 EPUB 内嵌脚本，不加载远程资源。
- 不将整本书上传至大模型 API 以完成转换。
- 不自动把 AI 输出写入正式 Markdown；所有未来 AI 写入均须预览、编辑、确认。
- 不做全书类型分析、知识图谱推断、掌握度判定、自动测验或云同步，直到核心阅读闭环通过手工验收。

## 文档导航

| 文档 | 用途 |
|---|---|
| [AGENTS.md](AGENTS.md) | 任何执行 Agent 的硬规则、读取顺序、TDD、停止点 |
| [docs/CONSTRUCTION_PLAN.md](docs/CONSTRUCTION_PLAN.md) | 唯一施工方案；任务已细拆为低上下文模型可执行单元 |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 模块边界、数据流、决策、风险与目录布局 |
| [docs/contracts/README.md](docs/contracts/README.md) | 运行时 Markdown/索引/定位/笔记/标签/重导入契约 |
| [docs/quality/ACCEPTANCE.md](docs/quality/ACCEPTANCE.md) | 自动化和用户手工验收清单 |
| [docs/STATUS.md](docs/STATUS.md) | 唯一状态账本与交接记录 |

## 下一步

在你明确说“执行 `LR-PHASE-01`”之前，禁止创建 `package.json`、安装 npm 依赖、写 TypeScript 业务代码或部署至 Vault。