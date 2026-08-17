# LReading 施工方案

<!-- LR-ANCHOR:CONSTRUCTION-PLAN -->

> **这是唯一施工方案。** 本文件已将每个阶段拆成低上下文 Agent 可逐项执行的小任务。每次只允许实施一个 `LR-PHASE-NN`；完成对应 `LR-CHECK-NN` 并更新 `STATUS.md` 后立即停止，等待用户授权。

## 0. 所有阶段的通用执行规则

### 0.1 任务编号与完成标准

- 每个 `Task NN.X` 是一个原子工作单元。不得跳号、合并、凭印象声称完成。
- 每个 Task 开始前，执行 Agent 必须在工作记录中写清：输入、允许修改文件、预期命令、停止条件。
- 只要 Task 要新增/改变生产行为，必须遵循：**先写一个会因行为缺失而失败的测试 → 亲自运行看到预期失败 → 最小实现 → 亲自运行通过**。
- 测试失败若是语法错误、导入错误、fixture 错误，而不是目标行为缺失，先修测试，重新取得正确的 RED，不能直接进入实现。
- 每个阶段的文件范围是硬边界。需要额外文件时，停下，说明原因，修改本计划后再继续。

### 0.2 每阶段开始前的固定命令

在仓库根目录执行：

```bash
git status --short --branch
python3 scripts/check_skeleton.py  # PHASE-01 以后由后续质量脚本取代/并存
```

若存在不属于当前阶段的未提交改动，先停下报告；不得混入本阶段提交。

### 0.3 每阶段结束后的固定动作

1. 运行该阶段 `LR-CHECK-NN` 的全部命令；记录真实输出和退出码。
2. 运行 `git diff --check`。
3. 更新 `docs/STATUS.md`：账本行、顶部当前结论、交接记录、下一建议。
4. 检查本计划、架构、契约中是否有已过时的“将在 PHASE”表述；只改摘要/规范，不改历史交接。
5. 不自动进入下阶段。

### 0.4 运行时数据保护规则

- 所有真实 EPUB、真实书籍正文、用户 Vault、用户笔记、API Key、绝对用户路径不得进入仓库、测试 fixture、日志或提交。
- 除 `fixtures/` 内自写的最小测试材料外，禁止将任何版权书内容提交到 Git。
- 所有 Vault 写入必须先有可预览的写入计划；写入必须限制在 `LReading/` 相对路径前缀内。

---

# LR-PHASE-00：项目骨架与文档冻结

<!-- LR-ANCHOR:PHASE-00 -->

**状态目标：** 已完成。只建立计划与协作约束，不产生可运行插件。

## 目标

创建可供低能力 Agent 安全接力的文档骨架：范围、架构、契约、验收、状态账本、空目录与结构检查器。明确移除 `数据摘要.md`。

## 允许改动

```text
README.md
AGENTS.md
docs/**
src/README.md
tests/README.md
fixtures/README.md
scripts/README.md
scripts/check_skeleton.py
```

## Task 00.1 — 写项目入口与冻结范围

- 输入：已确认的用户需求与收敛设计原则。
- 创建：`README.md`。
- 必须写入：最小闭环、运行时 Vault 布局、8 条设计原则、第一版明确不做事项、文档导航。
- 必须写明：没有 `数据摘要.md`；EPUB 转换使用代码而不是大模型。
- 停止条件：不得创建 `package.json`、`manifest.json`、任何 TypeScript/JavaScript 业务文件。

## Task 00.2 — 写 Agent 执行协议

- 输入：`README.md`。
- 创建：`AGENTS.md`。
- 必须写入：阅读顺序、一阶段授权规则、TDD、任务原子性、Vault 路径规则、用户数据保护、交接模板。
- 必须写入 11 条不变量，且包含“没有 `数据摘要.md`”。
- 停止条件：不得把任一未来阶段写为已经实现。

## Task 00.3 — 写架构与契约

- 输入：`README.md`、`AGENTS.md`。
- 创建：`docs/ARCHITECTURE.md`、`docs/contracts/README.md`。
- 架构必须定义：分层、依赖方向、Vault 文件所有权、导入/笔记/重导入数据流、风险表、未来 AI 边界。
- 契约必须定义：`BookManifest`、章节 frontmatter、段落 block ID、`SourceRef`、阅读记录格式、书籍标签、系统/用户区块、重导入决策。
- 停止条件：契约只定义接口与不变量，不写 TypeScript schema 或实现。

## Task 00.4 — 写施工、验收和状态账本

- 输入：前述文档。
- 创建：本文件、`docs/quality/ACCEPTANCE.md`、`docs/STATUS.md`。
- 施工方案必须有 `LR-PHASE-00` 至 `LR-PHASE-11`，每个阶段都有唯一 `LR-CHECK-NN`。
- `STATUS.md` 只能将 PHASE-00 写为完成；PHASE-01 为 `ready`，之后为 `blocked` 或 `deferred`。
- 停止条件：不声称未执行命令成功。

## Task 00.5 — 建立空目录说明和结构检查器

- 创建：`src/README.md`、`tests/README.md`、`fixtures/README.md`、`scripts/README.md`。
- 创建：`scripts/check_skeleton.py`。它只检查文件/锚点/禁止实现文件，不读写业务数据，不安装依赖。
- 检查器必须失败于：缺少必需文档、Phase/Check 不成对、重复 Phase/Check、出现 `package.json`/`manifest.json`、出现非该脚本的 `.ts/.js/.mjs/.cjs` 文件。
- 停止条件：不得创建实际测试或插件实现。

## LR-CHECK-00

```bash
python3 scripts/check_skeleton.py
git diff --check
```

**通过条件：** 两个命令退出码均为 0；检查器报告所有 12 个 phase/check 成对，且确认不存在 npm 配置、manifest 或业务源码。

---

# LR-PHASE-01：工具链与最小 Obsidian 插件壳

<!-- LR-ANCHOR:PHASE-01 -->

## 目标

建立可测试、可构建、可被 Obsidian 识别的最小插件壳。只证明工具链、manifest、load/unload 和一个无业务副作用的占位命令可运行。

## 前置

- `LR-PHASE-00` 为 `done`。
- 用户明确授权本阶段。
- 已加载 `obsidian-plugin-development` 与 `test-driven-development` skill。

## 允许改动

```text
package.json
package-lock.json
tsconfig.json
esbuild.config.mjs
vitest.config.mjs
eslint.config.mjs
manifest.json
versions.json
styles.css
.gitignore
src/main.ts
tests/smoke/**
tests/helpers/**
docs/STATUS.md
docs/CONSTRUCTION_PLAN.md  # 只可补真实依赖版本/偏离
```

## Task 01.1 — 记录起点和锁定包管理器

- 输入：`node --version`、`npm --version`、`git status --short --branch`。
- 在 STATUS 增加 `in_progress` 开始记录，写入真实 Node/npm 版本。
- 决定：仅使用本地 `npm` 与 `package-lock.json`；禁止全局安装任何包。
- 停止条件：不要创建源文件或安装依赖。

## Task 01.2 — 写 package scripts 与空配置

- 先创建最小 `package.json`：`dev`、`lint`、`typecheck`、`test`、`build` 五个 scripts 的预期命令；不得有 `"type": "module"`。
- 创建空但语法正确的 TS/esbuild/Vitest/ESLint 配置文件。
- 安装开发依赖（仅项目内）：`typescript`、`esbuild`、`tslib`、`@types/node`、`obsidian`、`vitest`、`eslint`、`@eslint/js`、`typescript-eslint`。
- 记录每个实际安装版本；如果 package 安装失败，停止并报告，不替换为未验证的配置。
- 停止条件：此 Task 不写插件实现。

## Task 01.3 — RED：manifest 与版本同步 smoke test

- 创建 `tests/smoke/manifest.test.ts`。
- 断言期望：plugin id 固定为 `lreading`；名称、版本、最小 Obsidian 版本、description、desktop-only 声明存在；`versions.json[manifest.version]` 等于 `manifest.minAppVersion`。
- 运行此单文件，确认因 `manifest.json`/`versions.json` 缺失而失败。
- 停止条件：必须记录实际 RED 失败摘要。

## Task 01.4 — GREEN：创建 manifest/versions

- 创建 `manifest.json` 与 `versions.json`，使 Task 01.3 通过。
- 版本初始为 `0.0.1`；不宣布发布。
- 重跑目标测试，确认通过。
- 停止条件：不创建 `main.ts`。

## Task 01.5 — RED：插件生命周期 smoke test

- 创建 Obsidian mock helper，至少包含 `Plugin`、`Notice`、`addCommand`、`registerView`、`loadData`、`saveData` 的最小安全 stub。
- 创建 `tests/smoke/main.test.ts`，期望默认导出的插件 `onload()` / 同步 `onunload()` 不抛错，且 onload 注册 `lreading-open-library` 占位命令。
- 运行测试，确认因 `src/main.ts` 缺失而失败。
- 停止条件：不添加任何 EPUB/Markdown/笔记逻辑。

## Task 01.6 — GREEN：最小 main 与构建配置

- 创建 `src/main.ts`：默认导出插件类；只注册一个显示“尚未实现阅读库”的命令；`onunload(): void` 必须同步。
- 完成 esbuild 外部化：至少 `obsidian`、`electron`、`@codemirror/*`、`@lezer/*`；输出 CommonJS `main.js`。
- 完成 Vitest、ESLint、TS 配置。
- 运行 main smoke test，确认通过。
- 停止条件：不创建 ItemView/Modal/设置页；不连接 Vault。

## Task 01.7 — 静态质量门禁与最小发布卫生

- 写 `.gitignore`：忽略 `node_modules/`、`main.js`、maps、coverage、临时 Vault/真实 EPUB/运行数据；不要忽略源码或文档。
- 执行所有命令：
  ```bash
  npm run lint
  npm run typecheck
  npm test
  npm run build
  ```
- 断言 `main.js` 存在，且 bundle 含 `require("obsidian")` 或等价 externalized require。
- 停止条件：不复制到任何 Vault，不启用插件。

## LR-CHECK-01

```bash
npm run lint && npm run typecheck && npm test && npm run build
python3 scripts/check_skeleton.py --allow-toolchain
git diff --check
```

**通过条件：** 所有命令退出码 0；manifest 版本同步 smoke test 和生命周期 smoke test 均通过；`main.js` 生成但被 gitignore；手工 M-01 仍待用户确认，因此阶段状态为 `review`，不直接 `done`。

---

# LR-PHASE-02：核心领域模型与 Vault 安全边界

<!-- LR-ANCHOR:PHASE-02 -->

## 目标

建立纯 TypeScript 领域模型、相对 Vault 路径安全规则、系统/用户区块验证、原子写入 port。此阶段不解析 EPUB，不创建 Obsidian UI。

## 前置

- PHASE-01 为 `done`，或用户明确接受其 M-01 手工验收尚待处理但同意继续。
- 已加载 TDD skill。

## 允许改动

```text
src/domain/**
src/application/ports/**
src/infrastructure/vault/**
tests/unit/domain/**
tests/integration/vault/**
tests/helpers/**
tsconfig.json  # 仅允许为本阶段 Node 测试 adapter 增加必要的 lib/types 编译配置
docs/contracts/README.md
docs/STATUS.md
```

## Task 02.1 — RED：安全 Vault 相对路径

- 写 `tests/unit/domain/vault-path.test.ts`。
- 用例逐条覆盖：允许 `LReading/Books/book_x/书籍.md`；拒绝空路径、绝对 Unix/Windows 路径、`..`、重复根、反斜杠、`LReadingX/` 前缀逃逸。
- 运行测试，确认因 `safeVaultPath` 缺失而 RED。

## Task 02.2 — GREEN：实现路径领域函数

- 创建 `src/domain/vault-path.ts`，只处理字符串，不 import Obsidian/Node `path`。
- 实现 `assertSafeVaultPath()`、`isPathInsidePrefix()` 和目录段校验。
- 重跑目标测试。
- 停止条件：不得访问真实文件系统。

## Task 02.3 — RED：系统/用户区块解析

- 写 `tests/unit/domain/system-block.test.ts`。
- 覆盖：完整标记成功；缺开始/结束、顺序颠倒、重复、嵌套时拒绝更新；用户区原样保留。
- 运行并确认 RED。

## Task 02.4 — GREEN：实现区块边界函数

- 创建 `src/domain/system-block.ts`：只替换 SYSTEM 区，绝不改 USER 区。
- 重跑测试；添加空用户区与中文文本回归用例。
- 停止条件：不得生成书架/书籍真实文件。

## Task 02.5 — RED/GREEN：定义领域类型和 SourceRef 验证

- 先写 `tests/unit/domain/source-ref.test.ts`：有效 SourceRef；拒绝 `needs-review` 却被标为 source-backed、chapterPath 越界、block ID 与 paragraphId 不一致、空 quoteSnapshot。
- RED 后创建 `src/domain/book.ts`、`src/domain/source-ref.ts`、`src/domain/reading-record.ts`。
- 仅定义/验证契约所需字段，不引入 Zod 以外的业务依赖；如决定使用 Zod，先在 STATUS 记录决定和版本。
- 重跑目标测试。

## Task 02.6 — RED/GREEN：实现可测试 Vault Adapter port

- 写内存/临时目录 adapter 的集成测试：父目录递归创建、原子写入、拒绝 prefix 外路径、写失败不截断旧文件。
- 创建 `src/application/ports/vault.ts` 与 `src/infrastructure/vault/node-vault-adapter.ts`。
- 生产 Obsidian adapter 如需创建，只实现相同 port，不在此阶段接入 UI。
- 停止条件：不写真实 Vault。

## LR-CHECK-02

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 所有路径/区块/SourceRef/原子写入测试通过；纯领域文件无 `from "obsidian"`；无 EPUB 包、无 UI 命令、无 Vault 真实写入。

---

# LR-PHASE-03：EPUB 解析与规范化中间模型

<!-- LR-ANCHOR:PHASE-03 -->

## 目标

在纯解析边界把安全 EPUB 输入转换为 `NormalizedBook`，保留书籍元信息、spine 顺序、章节 XHTML 内容、TOC 候选和资源表；不写 Markdown、不写 Vault。

## 前置

- PHASE-02 为 `done`。
- 先阅读 `LR-DECISION-02`、`LR-RISK-01` 与 `LR-CONTRACT:BOOK-MANIFEST`。
- 任何新 npm 包都必须在开始记录中说明用途、维护状态、许可和替代方案。

## 允许改动

```text
package.json
package-lock.json
src/domain/epub-normalize.ts
src/infrastructure/epub/**
tests/unit/epub/**
tests/integration/epub/**
fixtures/epub/**
docs/STATUS.md
docs/ARCHITECTURE.md  # 仅记录已决定的解析依赖
```

## Task 03.1 — 建合成 EPUB fixture 规范

- 创建 `fixtures/epub/README.md`，声明所有内容为自写、非版权书文本。
- 仅创建以下最小 fixture：正常双章书、无 container、坏 OPF、路径穿越 ZIP、超限条目/体积模拟、含脚本 XHTML、缺资源引用。
- 每个 fixture 只包含触发一个测试行为的最小数据。
- 停止条件：不得放入真实书名、真实段落或网上下载 EPUB。

## Task 03.2 — RED/GREEN：ZIP 安全边界

- 先写失败测试：拒绝绝对 ZIP entry、`../`、超过配置的条目数、超过未压缩总量、压缩比异常（若库可提供）。
- 再创建 `src/infrastructure/epub/zip-safety.ts`，返回明确错误 code，而非吞错或部分写入。
- 不解压到宿主临时目录；尽可能在内存中处理。

## Task 03.3 — RED/GREEN：container 与 OPF 定位

- 测试正常 `META-INF/container.xml` 找到 OPF；缺失/无效 XML 返回 `invalid_container`；OPF manifest/spine 缺字段返回 `invalid_package`。
- 实现 XML 解析与规范化，不使用正则解析 XML。
- 输出只为纯对象：metadata、manifest、spine、nav/ncx 资源引用。

## Task 03.4 — RED/GREEN：spine 与 XHTML 安全清理

- 测试按 spine 顺序，不按 ZIP 遍历顺序；缺 spine item 有 warning；脚本、事件 handler、iframe、远程 URL 被移除或报告，不执行。
- 实现每个 spine 文档读取与安全 DOM 清理。
- 保留语义标签所需信息（heading、paragraph、em/strong、list、blockquote、table、image link、footnote link）。

## Task 03.5 — RED/GREEN：TOC 解析与章节候选

- 测试 nav XHTML 优先，NCX 可后备；深层 TOC 树保留顺序；无法映射 source href 的 TOC 节点成为 warning，不伪造链接。
- 实现 TOC 解析，输出 `NormalizedTocNode[]`。

## Task 03.6 — RED/GREEN：形成 NormalizedBook

- 测试输出 book metadata、sourceHash、稳定 spine index、章节候选、资源清单和 warnings；相同 bytes 输入结果中 sourceHash 相同。
- 实现 `parseEpub(bytes, limits)`，不得调用 Markdown renderer 或 Vault adapter。
- 停止条件：不生成 Markdown、block ID、目录文件或书架。

## LR-CHECK-03

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 安全 ZIP、container/OPF、spine、XHTML 清理、TOC、NormalizedBook 全部有测试；fixture 无真实版权内容；解析没有发生磁盘/Vault 写入。

---

# LR-PHASE-04：Markdown 渲染、资源与稳定定位

<!-- LR-ANCHOR:PHASE-04 -->

## 目标

将 `NormalizedBook` 确定性渲染为章节 Markdown、资源写入计划、`书籍.md`/`目录.md`/`阅读笔记与摘要.md`/`书架.md` 的内容计划；为可定位段落创建 block ID。此阶段只生成计划对象，不写 Vault。

## 前置

- PHASE-03 为 `done`。
- 阅读 `LR-CONTRACT:SOURCE-LOCATION`、`LR-CONTRACT:READING-NOTES` 与 `LR-DECISION-03/04/06`。

## 允许改动

```text
src/domain/markdown-render.ts
src/domain/block-id.ts
src/domain/book-layout.ts
src/domain/asset-plan.ts
tests/unit/markdown/**
tests/unit/domain/**
fixtures/epub/**
docs/STATUS.md
```

## Task 04.1 — RED/GREEN：稳定 book/chapter/paragraph ID

- 先测：相同输入和 parserVersion 得到相同 ID；不同内容得到不同内容哈希片段；同章重复段落仍产生不同 paragraph ID；ID 只含允许字符。
- 实现 `bookId`、`chapterId`、`paragraphId` 生成函数；不得使用随机 UUID 或当前时间。

## Task 04.2 — RED/GREEN：基础 XHTML 到 Markdown 语义渲染

- 逐个最小测试：标题、段落、强调、列表、引用、链接、图片、换行；每个可定位段落末尾有 `^p_...`。
- 对不支持结构（复杂 table、MathML、SVG）输出保守降级和结构化 warning；不得丢失静默、不得调用模型。
- 输出 Markdown 必须 UTF-8、无脚本、无远程资源。

## Task 04.3 — RED/GREEN：资源提取计划

- 测试只允许图片/安全资源 MIME 类型；资源目标名称使用内容哈希；相同资源去重；坏/缺失资源产生 warning。
- 实现 asset write plan，不实际写文件。

## Task 04.4 — RED/GREEN：章节 frontmatter 与 SourceRef 映射

- 测试产出满足契约的 frontmatter；`book` 指向 `[[书籍]]`；没有默认复制书籍 tags；每个 block 可构造 `verified` SourceRef。
- 实现 source map/章节渲染返回值。

## Task 04.5 — RED/GREEN：书级 Markdown 计划

- 测试生成：`书籍.md`、`目录.md`、`阅读笔记与摘要.md`、`书架.md` 的初始内容；前三者含正确系统/用户区块；没有任何 `数据摘要.md` 路径。
- `阅读笔记与摘要.md` 只创建初始 frontmatter/标题，不填假笔记。
- 停止条件：不接入 Vault Adapter，不添加 Obsidian 命令。

## LR-CHECK-04

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 渲染结果针对合成 fixture 可预测；每个可选段落有唯一 block ID；无 `数据摘要.md` 产物、无远程 URL/脚本；尚无真实 Vault 写入。

---

# LR-PHASE-05：导入命令与受控 Vault 写入

<!-- LR-ANCHOR:PHASE-05 -->

## 目标

把 Phase 03/04 的纯解析与写入计划接入 Obsidian 导入命令，先预览、再确认、再受控原子写入。实现导入后章节可读、目录可跳转、书籍入口存在。

## 前置

- PHASE-04 为 `done`。
- 用户提供一个真实无 DRM EPUB 仅用于本地手工验收；它不得提交。
- 先阅读 `LR-RISK-01`、Vault adapter 契约、M-02。

## 允许改动

```text
src/application/import-book.ts
src/infrastructure/vault/obsidian-vault-adapter.ts
src/ui/import-epub.ts
src/ui/import-preview-modal.ts
src/ui/commands.ts
src/main.ts
styles.css
tests/integration/import/**
tests/smoke/**
docs/STATUS.md
```

## Task 05.1 — RED/GREEN：导入写入计划验证

- 测试：写入前拒绝不安全路径、重复目标、缺少 required entry；计划仅包含 `LReading/Books/<bookId>/` 和 `LReading/书架.md`；用户笔记路径不得在 update list 中。
- 实现 application 层的 `validateImportPlan()`。

## Task 05.2 — RED/GREEN：导入原子性与目录创建

- 用内存/临时 adapter 测试：确认前 0 写入；写入失败时不留下半完成 registry；所有父目录创建；成功后 manifest 最后写入/标记 complete。
- 实现 import use case，保留可恢复 failed state；不得用绝对 Vault 路径。

## Task 05.3 — RED/GREEN：导入预览模型

- 测试预览包含书名、作者、章节数、资源数、warnings、目标路径、是否发现同 hash/同标题候选；不泄漏原文全文。
- 实现 preview builder。

## Task 05.4 — RED/GREEN：Obsidian 文件选择与确认 Modal

- 测试 UI boundary 接收 `ArrayBuffer` 后传给 application；取消选择不写入、不假装成功；成功选择不能被 focus 事件误判取消。
- 注册 `lreading-import-epub` 命令，显示预览 Modal，确认按钮才调用写入。
- CSS 用 Obsidian 主题变量；不硬编码浅色背景。

## Task 05.5 — RED/GREEN：导入后导航

- 测试/运行时 smoke：完成导入后能打开 `书籍.md` 或 `目录.md`；目录链接是相对内部 wikilink；无 current position 时能回退到首本完整导入书。
- 实现最小导航服务/命令，不创建资料目录侧栏。

## Task 05.6 — 用户手工验收 M-02

- 用户用真实无 DRM EPUB 测试预览、确认、生成文件、目录、图片、浅色/深色可读性。
- Agent 只记录通过/失败现象，不读取或上传书内容。
- 停止条件：M-02 未确认则阶段 `review`，不可自称 `done`。

## LR-CHECK-05

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 合成 fixture 的导入写入计划、确认前零写入、失败不完整状态、成功后导航均有自动测试；M-02 明确待用户确认或已确认。

---

# LR-PHASE-06：选区阅读记录（摘录/笔记/摘要/问题）

<!-- LR-ANCHOR:PHASE-06 -->

## 目标

用户在已导入章节中选中原文后，能创建 quote/note/summary/question；系统从已验证章节构造 SourceRef，显示预览，并只追加写入 `阅读笔记与摘要.md`。

## 前置

- PHASE-05 为 `done` 或经用户批准在 `review` 状态继续。
- 阅读 `LR-CONTRACT:READING-NOTES` 与 `LR-CONTRACT:SOURCE-LOCATION`。

## 允许改动

```text
src/domain/reading-record.ts
src/application/create-reading-record.ts
src/ui/reading-record-modal.ts
src/ui/commands.ts
src/main.ts
styles.css
tests/unit/records/**
tests/integration/records/**
tests/smoke/**
docs/STATUS.md
```

## Task 06.1 — RED/GREEN：从活动章节验证 SourceRef

- 测试：只有 `type: lreading-chapter`、完整 frontmatter、存在的 block ID 和非空选区才能获得 `verified` SourceRef；普通笔记、未导入 Markdown、跨章节错误选区必须拒绝。
- 实现解析与验证；系统字段不由 UI 文本直接信任。

## Task 06.2 — RED/GREEN：阅读记录 Markdown 渲染

- 测试每种 type 的 Markdown 头、证据状态、位置链接、quoteSnapshot 限长、用户正文、记录 ID 注释；`question` 可没有选区但必须有 book。
- 实现 `renderReadingRecord()`，输出仅为追加片段。

## Task 06.3 — RED/GREEN：只追加、绝不覆盖

- 用 adapter 测试：首次创建初始化 notes 文件；后续记录追加不删除任何已有用户文字；写入失败保留旧文件；source-backed 的 invalid SourceRef 拒绝写入。
- 实现 application use case。

## Task 06.4 — RED/GREEN：记录 Modal 与预览确认

- 测试 Modal 显示类型、书名、章节、引用预览和 Markdown 预览；取消时零写入；确认时调用应用 use case 一次。
- 注册选区命令或 editor menu action；不做 AI 建议按钮。

## Task 06.5 — 用户手工验收 M-03

- 在真实导入章节至少创建两种记录；验证位置跳回、重开 Obsidian 后仍可跳转、原 notes 内容未被覆盖。
- Agent 记录手工结果；未确认即 `review`。

## LR-CHECK-06

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 选区验证、所有记录类型渲染、追加语义、取消零写入都有测试；M-03 状态被如实记录。

---

# LR-PHASE-07：书架、目录与资料目录功能区

<!-- LR-ANCHOR:PHASE-07 -->

## 目标

提供不替代原生 Markdown 的导航界面：全局书架、本书目录、资料目录（按书籍/记录类型/标签关系聚合）。统计从 Markdown/manifest 派生显示，**不创建数据摘要.md**。

## 前置

- PHASE-06 为 `done` 或用户批准继续。
- 阅读 `LR-DECISION-01/05/06` 与 M-04。

## 允许改动

```text
src/application/library-index.ts
src/application/open-book.ts
src/ui/library-view.ts
src/ui/toc-view.ts
src/ui/commands.ts
src/main.ts
styles.css
tests/unit/library/**
tests/integration/library/**
tests/smoke/**
docs/STATUS.md
```

## Task 07.1 — RED/GREEN：从 Vault 建立资料目录索引

- 测试：只索引 complete manifest；读取 `书籍.md` tags、章节数、`阅读笔记与摘要.md` 的记录类型计数；损坏/未完成书跳过并给 warning。
- 不把统计回写成任何 `.md` 报告。

## Task 07.2 — RED/GREEN：书架系统区更新

- 测试 `书架.md` 只替换 SYSTEM 区，保留 USER 区；条目指向 `书籍.md`；按最近导入/阅读的确定性规则排序。
- 使用 PHASE-02 的系统区块函数，不复制实现。

## Task 07.3 — RED/GREEN：扁平目录树显示数据

- 测试 nested TOC 转为 depth-first sibling rows；至少三层；不把子节点嵌到 flex row。
- 实现纯 `flattenTocNodes()`；UI 按 depth 缩进，CSS 使用 `min-width: 0`、wrap、无横向溢出。

## Task 07.4 — RED/GREEN：资料目录 ItemView

- 测试空状态、单书、多书、按书打开、按记录类型过滤的 view model；Obsidian runtime mock 不依赖 DOM。
- 注册 `lreading-open-library` 和 `lreading-show-toc` 命令；默认 fallback 为当前书 → 最近完整书 → 明确空状态。

## Task 07.5 — 用户手工验收 M-04（第一部分）

- 至少两本书下验证书架、目录、资料目录、窄侧栏、深/浅色主题。
- 仅记录结果，真实书内容不进入仓库。

## LR-CHECK-07

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 索引不产出 `数据摘要.md`；系统区保护、目录扁平化、初次使用 fallback 均有测试；M-04（界面部分）如实记录。

---

# LR-PHASE-08：标签语义同步与可选批量物化

<!-- LR-ANCHOR:PHASE-08 -->

## 目标

用户可设置书籍级 Obsidian tags。默认通过 `book` 关系语义同步，不复制到章节/笔记；另提供明确预览的可选“物化书籍标签到章节”功能，并保证不伤害用户 tags。

## 前置

- PHASE-07 为 `done` 或用户批准继续。
- 阅读 `LR-CONTRACT:BOOK-TAGS`、`LR-DECISION-05`、`LR-RISK-01`。

## 允许改动

```text
src/domain/tags.ts
src/application/set-book-tags.ts
src/application/materialize-book-tags.ts
src/ui/book-tags-modal.ts
src/ui/commands.ts
src/main.ts
styles.css
tests/unit/tags/**
tests/integration/tags/**
docs/STATUS.md
```

## Task 08.1 — RED/GREEN：标签语法和规范化

- 测试允许合法 Obsidian 标签（字母、数字非首位、`_`、`-`、`/`）；拒绝空白、`#` 前缀重复、非法字符、重复值；保留嵌套标签。
- 实现纯标签标准化函数。

## Task 08.2 — RED/GREEN：安全合并书籍 tags

- 测试：旧 `lreadingBookTags` 被替换，新系统 tags 加入，用户新增 tags 绝不删除；多次同操作幂等；frontmatter 其他字段原样保留。
- 实现只更新 `书籍.md` 的 use case。

## Task 08.3 — RED/GREEN：默认语义同步

- 测试：设置书籍 tags 不改任何章节文件和 `阅读笔记与摘要.md`；资料目录基于 `book` 关系与书籍 tags 显示过滤结果。
- 明确本 Task 不创建“同步修改数百文件”的默认行为。

## Task 08.4 — RED/GREEN：可选物化预览和执行

- 测试预览返回将改变的章节路径、旧/新 `lreadingBookTags`，而不执行写入；确认后只写 `lreadingBookTags`，不覆盖章节用户 `tags`；取消时零写入。
- 实现独立命令 `lreading-materialize-book-tags`，绝不在“设置书籍标签”中隐式调用。

## Task 08.5 — 用户手工验收 M-04（标签部分）

- 用手工用户 tags 验证合并；检查默认操作不改章节；检查物化预览、确认和取消。

## LR-CHECK-08

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 标签合法性、合并保留、默认零章节修改、物化预览/取消/确认均有测试；无 `数据摘要.md`；M-04 标签项如实记录。

---

# LR-PHASE-09：重导入、版本安全与迁移保护

<!-- LR-ANCHOR:PHASE-09 -->

## 目标

处理同一本书再次导入：相同文件跳过；不同文件让用户选择新书或更新派生内容；更新前备份；回链无法映射时明确标记 `needs-review`，不伪造正确性。

## 前置

- PHASE-08 为 `done` 或用户批准继续。
- 阅读 `LR-CONTRACT:BOOK-MANIFEST`、`LR-CONTRACT:SOURCE-LOCATION`、`ReimportDecision` 与 `LR-RISK-01`。

## 允许改动

```text
src/domain/reimport.ts
src/application/reimport-book.ts
src/infrastructure/vault/**
src/ui/reimport-preview-modal.ts
src/ui/import-epub.ts
tests/unit/reimport/**
tests/integration/reimport/**
docs/contracts/README.md
docs/STATUS.md
```

## Task 09.1 — RED/GREEN：导入版本比较

- 测试相同 `sourceHash` → `skip-identical`；不同 hash 且 title 相同 → 要求选择；不同 hash/title → 可作为新书；禁止系统自动覆盖。
- 实现纯 `planReimport()`。

## Task 09.2 — RED/GREEN：paragraph 映射与不确定状态

- 测试 content hash/上下文能唯一映射时保留位置；零/多候选时必须得到 `needs-review`；禁止任意选择第一个候选。
- 实现 mapping report；不要改 `阅读笔记与摘要.md` 正文。

## Task 09.3 — RED/GREEN：备份和原子更新

- 测试更新前备份派生目录/manifest；写入失败可恢复；旧章节中本次不再存在的派生文件被受控清理；用户笔记从不删除。
- 在 adapter 中实现受控事务/备份策略；记录存储空间影响。

## Task 09.4 — RED/GREEN：重导入预览确认

- 测试 UI 显示三种选择、受影响章节数、可映射/需复核回链数和备份说明；取消零写入。
- 只有确认 `update-derived-content` 才进入写入 use case。

## Task 09.5 — 用户手工验收 M-05

- 用户用相同 EPUB 和一份小改动副本做验收；记录选项、备份、笔记保护和无法映射提示。
- 不上传副本或真实结果正文。

## LR-CHECK-09

```bash
npm run lint && npm run typecheck && npm test && npm run build
git diff --check
```

**通过条件：** 三种决策、映射歧义、备份、失败恢复、旧派生文件清理、用户笔记保护均有自动测试；M-05 真实状态已记录。

---

# LR-PHASE-10：发布前真实验收、隐私与恢复演练

<!-- LR-ANCHOR:PHASE-10 -->

## 目标

将已经实现的核心闭环打磨为可交付版本：测试/构建、隐私扫描、合成 fixture 全链验证、临时 Vault 恢复演练、Obsidian 手工验收清单。此阶段不新增用户功能。

## 前置

- PHASE-09 为 `done` 或所有 review 项已由用户明确接受。
- 阅读 `docs/quality/ACCEPTANCE.md` 全文。

## 允许改动

```text
scripts/check-release.*
.github/workflows/**                 # 仅在用户明确允许 CI 时
README.md
SECURITY.md
CHANGELOG.md
package.json
.gitignore
tests/**
docs/quality/ACCEPTANCE.md
docs/STATUS.md
```

## Task 10.1 — RED/GREEN：发布卫生脚本

- 写测试或可重复 shell/Python check：拒绝追踪 `node_modules`、构建包、真实 `.epub`、API Key 模式、绝对用户路径、下载来源、Vault 运行目录。
- 脚本只能报告和退出非零，不删除文件。

## Task 10.2 — 合成 fixture 全链演练

- 在临时测试 Vault 运行：解析 → 预览 → 确认导入 → 创建笔记 → 相同文件跳过 → 小改动重导入 → 验证 notes 未覆盖/回链状态。
- 所有步骤使用合成 fixture；记录真实耗时与失败。

## Task 10.3 — 构建产物与插件加载验收

- 校验 manifest/versions 一致、bundle externalize `obsidian`、styles 存在、build 不含源 maps（若发布策略如此定义）。
- 用户在真实 Obsidian 执行 M-01 至 M-05；未完成项必须保留为 release blocker 或明确的已知限制。

## Task 10.4 — 文档和恢复说明

- README 增加安装、支持输入、数据位置、重导入、隐私、卸载/备份、已知限制。
- 创建 SECURITY/CHANGELOG 仅当其内容真实；不要为凑文件编造安全认证。
- 停止条件：不实现 AI、不创建向量库、不改核心数据契约。

## LR-CHECK-10

```bash
npm run lint && npm run typecheck && npm test && npm run build
npm run check:release
git diff --check
```

**通过条件：** 全部命令真实退出 0；临时 Vault 合成闭环完成；所有用户手工验收明确标记；仓库无隐私/版权输入。

---

# LR-PHASE-11：书籍类型识别与受控知识整理（待定）

<!-- LR-ANCHOR:PHASE-11 -->

**初始状态：`deferred`。** 只有 PHASE-10 完成且用户重新确认 AI、隐私、模型供应商、数据范围和输出形式后才能启动。

## 目标

在不修改原书正文的前提下，让大模型对用户明确选择的范围生成**可回链的候选草稿**：书籍类型/分析模块、章节摘要、时间线、概念、命题、因果/论证链等。用户预览、编辑、确认后才写入 Markdown。

## 前置决策（必须逐项获得用户确认）

1. 模型供应商、模型名、API key 存储方式、费用上限。
2. 可发送的范围：仅书名/目录/前言/选定章节/整书；默认最小必要范围。
3. 书籍类型应是多标签+分析模块，而不是单一分类。
4. 草稿输出路径、跨书知识笔记的命名策略、保留/删除策略。
5. 每次生成的数量/章节范围/最大 token 预算。

## 允许改动（授权后才细化）

```text
src/application/ai/**
src/infrastructure/llm/**
src/ui/ai/**
src/domain/knowledge/**
tests/**
docs/contracts/**
docs/ARCHITECTURE.md
docs/CONSTRUCTION_PLAN.md
docs/STATUS.md
```

## 预期 Task（禁止现在执行）

- 11.1 新增 AI 草稿/确认/撤销数据契约；先写安全与来源验证测试。
- 11.2 实现最小上下文选择和注入防护；书内容视为不可信数据。
- 11.3 实现类型候选：书名为弱信号，目录/前言/采样为依据，用户可修改。
- 11.4 实现模块化候选草稿：时间线、概念、主张、机制、证据、限制；每项带 SourceRef。
- 11.5 实现预览、编辑、确认写入；AI 不具备直接写 Vault 权限。
- 11.6 执行费用、隐私、错误回复、伪造来源、模型超时、取消和撤销验收。

## LR-CHECK-11

在用户确认上述前置决策后再定义；不得预先宣称任何 AI 行为已通过。
