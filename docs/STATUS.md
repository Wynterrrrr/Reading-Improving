# LReading 状态账本

<!-- LR-ANCHOR:STATUS-LEDGER -->

> 本文件是项目实施状态的唯一事实来源。计划文件描述“应做什么”，本文件记录“实际做了什么”。不得编造命令输出、提交、部署或人工验收结果。

## 当前结论

- 最后更新：2026-08-17
- 项目状态：**LR-PHASE-03 已完成；安全 EPUB 解析与规范化中间模型已通过自动验收。**
- 已完成：`LR-PHASE-00`、`LR-PHASE-01`、`LR-PHASE-02`、`LR-PHASE-03`。
- 当前阶段：`LR-PHASE-03` 已完成；下一阶段为 `LR-PHASE-04`（Markdown 渲染、资源与稳定定位）。
- 解析依赖：`fflate@0.8.3`（MIT）、`fast-xml-parser@5.11.0`（MIT）、`linkedom@0.18.13`（ISC）；仅在内存中处理合成 EPUB，无真实书籍输入。
- 自动验收：9 个测试文件、52/52 测试通过；`npm run lint`、`npm run typecheck`、`npm run build`、`git diff --check` 均通过。
- 工具链：Node `v22.23.2`、npm `10.9.8`、TypeScript `6.0.3`、esbuild `0.28.2`、Vitest `4.1.10`、ESLint `10.8.1`、Obsidian types `1.13.1`；仅项目本地 npm 依赖，无全局安装。
- 自动验收：`npm run lint`、`npm run typecheck`、`npm test`（4/4）、`npm run build`、`python3 scripts/check_skeleton.py --allow-toolchain`、`git diff --check` 均已真实通过。
- M-01：已部署至 `ObsdianDrive-main/.obsidian/plugins/lreading/`，三份产物与源码构建结果匹配；插件 `lreading` 已启用、重载成功，命令 `lreading:lreading-open-library` 已注册和执行；调试捕获下无运行时/控制台错误。
- 尚未进行：真实 EPUB 导入、Markdown 转换、阅读笔记 UI、Vault 书籍数据写入、模型 API 调用。
- 仓库动作：GitHub `Wynterrrrr/Reading-Improving`，当前分支 `main`；本阶段改动尚待按阶段提交。
- 关键设计确认：无 `数据摘要.md`；统计仅为后续可重建的 UI/索引信息，不产生第二份 Markdown 数据源。

## 阶段账本

状态词只能为：`blocked`、`ready`、`in_progress`、`review`、`done`、`deferred`。

| 阶段 | 名称 | 状态 | 前置 | 自动验收 | 用户手工验收 |
|---|---|---:|---|---|---|
| LR-PHASE-00 | 文档骨架与契约冻结 | done | — | `LR-CHECK-00` 通过 | 不需要 |
| LR-PHASE-01 | 工具链与最小插件壳 | done | 00 | `LR-CHECK-01` 通过 | M-01：已通过 |
| LR-PHASE-02 | 核心领域模型与 Vault 安全边界 | done | 01 | `LR-CHECK-02` 通过 | 不需要 |
| LR-PHASE-03 | EPUB 解析与规范化中间模型 | done | 02 | `LR-CHECK-03` 通过 | 不需要 |
| LR-PHASE-04 | Markdown 渲染、资源与稳定定位 | blocked | 03 | `LR-CHECK-04` | 章节阅读与回链 |
| LR-PHASE-05 | 导入命令与受控写入流程 | blocked | 04 | `LR-CHECK-05` | 真实样书导入 |
| LR-PHASE-06 | 选区阅读记录：摘录/笔记/摘要/问题 | blocked | 05 | `LR-CHECK-06` | 选区到笔记回链 |
| LR-PHASE-07 | 书架、目录与资料目录功能区 | blocked | 06 | `LR-CHECK-07` | 多书浏览 |
| LR-PHASE-08 | 标签语义同步与可选批量物化 | blocked | 07 | `LR-CHECK-08` | 标签预览与撤销确认 |
| LR-PHASE-09 | 重导入、版本安全与迁移保护 | blocked | 08 | `LR-CHECK-09` | 修订 EPUB 验收 |
| LR-PHASE-10 | 发布前真实验收、隐私与恢复演练 | blocked | 09 | `LR-CHECK-10` | 全闭环验收 |
| LR-PHASE-11 | 书籍类型识别与受控知识整理 | deferred | 10 + 用户新授权 | `LR-CHECK-11` | 分类与草稿确认 |

## 已完成交接

### 2026-08-14 — LR-PHASE-00 交接

- 状态：`done`
- 完成 Task：00.1、00.2、00.3、00.4、00.5。
- 修改：`README.md`（目标、边界、运行时产物）；`AGENTS.md`（低上下文 Agent 协议）；`docs/ARCHITECTURE.md`（分层/数据流/风险）；`docs/contracts/README.md`（Markdown 与定位契约）；`docs/CONSTRUCTION_PLAN.md`（00–11 细化施工任务）；`docs/quality/ACCEPTANCE.md`（验收）；`docs/STATUS.md`（账本）；`src|tests|fixtures|scripts/README.md`（空目录边界）；`scripts/check_skeleton.py`（无依赖结构检查）；`.gitignore`（隐私/运行产物保护）。
- 自动验证：`python3 scripts/check_skeleton.py` → 退出码 0；报告 11/11 必需文档、12/12 phase/check 配对、24 个唯一稳定锚点、零业务实现/工具链文件、零 `数据摘要.md` 产物。`git diff --check` → 退出码 0。
- 补充 ad-hoc 验证：使用 `/tmp/hermes-verify-reading-skeleton-*.py` 在隔离副本中验证基线通过，并注入 `package.json` 与实际 `数据摘要.md`；检查器均以退出码 1 拒绝。另断言 `.gitignore` 含构建、Vault、EPUB（含 fixture 例外）和密钥保护规则。临时验证脚本及副本均已清理。
- 修复：ad-hoc 验证首次发现 `check_skeleton.py` 将 `Path` 与字符串集合比较，未能拒绝提前存在的 `package.json`；已改为 `relative.as_posix()` 比较后重新验证通过。
- 手工验证：不需要。
- 偏离：无。为避免检查器把“明确不创建数据摘要”的文档表述误判为产物，检查器按文件名是否实际存在来验证，而不是禁止文档文字出现该名称。
- 风险与未决项：本地仓库尚未提交/推送；未获得执行 PHASE-01 的授权。
- 下一建议：提交并推送本次文档骨架；之后等待用户审核或明确授权 `LR-PHASE-01`。

### 2026-08-17 — LR-PHASE-01 开始记录

- 状态：`in_progress`
- 用户授权：基于项目说明开始施工；本轮仅执行 LR-PHASE-01。
- 完成 Task：起点核验（对应 Task 01.1 的环境读取部分）。
- 真实起点：Node `v22.23.2`；npm `10.9.8`；git `2.43.0`；`main` 分支与 `origin/main` 一致；`python3 scripts/check_skeleton.py` 和 `git diff --check` 均退出码 0。
- 下一步：Task 01.2，创建 package scripts/config 并安装项目本地开发依赖。
- 停止范围：不导入 EPUB、不创建阅读笔记 UI、不连接 Vault、不调用大模型、不部署插件。

### 2026-08-17 — LR-PHASE-01 交接

- 状态：`review`
- 完成 Task：01.1、01.2、01.3、01.4、01.5、01.6、01.7。
- 修改：`package.json` / `package-lock.json`（本地 npm 工具链）；`tsconfig.json`、`esbuild.config.mjs`、`vitest.config.mjs`、`eslint.config.mjs`、`styles.css`（构建/测试/样式壳）；`manifest.json`、`versions.json`（Obsidian 元数据）；`src/main.ts`（仅 `lreading-open-library` 占位命令）；`tests/smoke/manifest.test.ts`、`tests/smoke/main.test.ts`、`tests/helpers/obsidian.ts`（manifest 与生命周期 smoke）；`docs/STATUS.md`（账本）。
- TDD 证据：Task 01.3 先运行 manifest test，因缺少 `manifest.json` 失败；创建 manifest/versions 后通过 2/2。Task 01.5 先运行 lifecycle test，最终只因缺少 `src/main.ts` 失败；创建最小入口后通过 2/2。期间测试自身的同步 `await` 语法错误与 mock hoist 警告均在进入实现前修正，不计作有效 RED。
- 自动验证：`npm run lint` → 0；`npm run typecheck` → 0；`npm test` → 2 文件、4/4 通过；`npm run build` → 0，生成 `main.js`（约 1.4 KB）；bundle 断言 `require("obsidian")` 与 `Reading Improving` 均存在；`python3 scripts/check_skeleton.py --allow-toolchain` → 0；`git diff --check` → 0。
- 手工验证：M-01 已通过。目标 Vault 为 `C:\Users\Wynter\Documents\GitHub\ObsdianDrive-main`；已原子部署 `main.js`（1399 B）、`manifest.json`（301 B）、`styles.css`（55 B）到 `.obsidian/plugins/lreading/`，逐字节与本地构建产物一致；启用列表含 `lreading`。CLI `reload` 后 `plugin:reload id=lreading` 成功，`plugins:enabled` 显示 lreading，命令 `lreading:lreading-open-library` 已注册且执行成功；开启 `dev:debug` 后二次执行，无 runtime errors / console errors。
- 偏离：M-01 原计划标为“待用户确认”，但用户要求默认执行所有步骤再统一复核，因此已使用 Obsidian CLI 完成可验证运行时验收。首次 `plugin:reload` 在 Vault 尚未重扫描时报告“not found”，随后执行 Vault `reload` 后成功；这证明的是扫描时序，不是插件错误。
- 风险与未决项：最小壳只验证插件加载与占位命令；不包含 EPUB、Vault 数据写入或阅读记录行为。部署目录位于用户的 Vault，同步策略由 Vault 的 obsidian-git 管理；本插件源码仓库不追踪这些部署产物。
- 下一建议：用户已授权连续施工核心 MVP，PHASE-01 提交后自动开始 `LR-PHASE-02`；`LR-PHASE-11` 仍需单独的模型/隐私/费用决策。

### 2026-08-17 — LR-PHASE-02 开始记录

- 状态：`in_progress`
- 授权：用户明确授权连续完成核心 MVP 阶段并最终统一复核。
- 已读：`LR-DECISION-01/03/04/06`、`LR-CONTRACT:SOURCE-LOCATION`、`LR-CONTRACT:READING-NOTES`、PHASE-02 施工任务以及 Vault 虚拟路径存储模式。
- 范围：纯 TypeScript 领域模型、测试 port、临时目录 Node adapter；绝不连接 Obsidian Vault API 或用户真实 Vault。
- 下一步：Task 02.1，安全 Vault 相对路径的失败测试。

### 2026-08-17 — LR-PHASE-02 交接

- 状态：`done`
- 完成 Task：02.1、02.2、02.3、02.4、02.5、02.6。
- 修改：`src/domain/vault-path.ts`、`system-block.ts`、`book.ts`、`source-ref.ts`、`reading-record.ts`（纯领域规则）；`src/application/ports/vault.ts`（Vault port）；`src/infrastructure/vault/node-vault-adapter.ts`（临时目录 adapter）；`tests/unit/domain/**`、`tests/integration/vault/**`（路径、区块、SourceRef、记录、原子存储测试）；`tsconfig.json`（ES2019/Node 类型以支持 Node adapter 测试）；`docs/CONSTRUCTION_PLAN.md`（补充本阶段允许的 tsconfig 工具链修复）；`docs/STATUS.md`。
- TDD 证据：02.1、02.3、02.5、02.6 均先运行测试并因目标模块不存在而 RED，再实现最小行为并转 GREEN。额外发现并修正 SourceRef 语义：`needs-review` 是合法的历史回链状态，只有 `source-backed` 阅读记录才要求 `verified`。
- 自动验证：`npm run lint` → 0；`npm run typecheck` → 0；`npm test` → 7 个测试文件、34/34 通过；`npm run build` → 0；`git diff --check` → 0。纯领域模块无 Obsidian/Node 运行时 import；无真实 Vault 路径泄漏；无 EPUB/UI 模块。
- 手工验证：不需要；本阶段所有写入均在 Vitest 临时目录，真实 Vault 未触碰。
- 偏离：为支持 Node 临时 adapter，实际将 TS target/lib 从 ES2018 提升到 ES2019，并启用 `types: ["node"]`；这是配置兼容修复，不改变插件目标运行时。没有引入 Zod，按计划保留原生 TypeScript 验证，减少阶段依赖。
- 风险与未决项：Node adapter 的真实 Obsidian adapter 尚未实现；EPUB 解析尚未开始。
- 下一建议：继续 `LR-PHASE-03`，只实现合成 EPUB fixture、安全 ZIP、container/OPF、spine、XHTML 清理与 TOC 规范化，不写 Vault/Markdown。

### 2026-08-17 — LR-PHASE-03 开始记录

- 状态：`in_progress`
- 范围：合成 EPUB fixture、ZIP 安全检查、container/OPF、spine、XHTML 安全清理、TOC 与 NormalizedBook；全部在内存中完成，不写 Markdown/Vault。
- 依赖决定：`fflate@0.8.3`（内存 ZIP 编解码，MIT）；`fast-xml-parser@5.11.0`（XML 解析，MIT）；`linkedom@0.18.13`（XHTML DOM 清理，ISC）。替代方案为手写/Node 解压与 XML 解析，安全性/维护成本较差；不使用网络或模型。
- 下一步：Task 03.1，自写最小 fixture 规范和生成器；不提交真实书内容。

### 2026-08-17 — LR-PHASE-03 交接

- 状态：`done`
- 完成 Task：03.1、03.2、03.3、03.4、03.5、03.6。
- 修改：`fixtures/epub/README.md`（合成 fixture 规则）；`tests/unit/epub/zip-safety.test.ts`、`tests/integration/epub/epub-fixtures.ts`、`parse-epub.test.ts`（内存 ZIP/EPUB 测试）；`src/infrastructure/epub/zip-safety.ts`、`parse-epub.ts`、`src/domain/epub-normalize.ts`（安全 ZIP/OPF/spine/XHTML/nav/NCX 解析）；`package*.json`、`esbuild.config.mjs`（解析依赖与 external 配置）；`docs/STATUS.md`。
- TDD 证据：ZIP safety、parseEpub、NCX fallback、目录 entry 和带 OPF 前缀的 TOC href 均先以失败测试暴露，后以最小实现转绿。解析测试还发现 XML 单值 creator 的命名空间/类型归一化问题，已修正为 `asValueArray`；缺失 spine manifest 项与计划对齐，改为 warning 而非中止有效章节。
- 自动验证：`npm run lint` → 0；`npm run typecheck` → 0；`npm test` → 9 文件、52/52 通过；`npm run build` → 0；`git diff --check` → 0。解析层无 Vault API；fixtures 无真实书名、正文或下载来源。许可实测：fflate MIT、fast-xml-parser MIT、linkedom ISC。
- 手工验证：不需要；无真实 EPUB/Vault 写入。
- 偏离：外部参考示例为 jszip/@xmldom，但实现使用已审查的 fflate/fast-xml-parser/linkedom，分别提供内存 ZIP、严格 XML 校验和安全 XHTML DOM 清理；在 STATUS 已记录理由与许可。
- 风险与未决项：复杂表格、MathML、SVG 尚未渲染（PHASE-04 的保守降级职责）；没有真实样书验收，按隐私规则延后至 PHASE-05 M-02。
- 下一建议：继续 `LR-PHASE-04`，将 NormalizedBook 确定性转成 Markdown/资源写入计划/稳定 block ID，仍不写 Vault。

## 环境与遗留

| 项目 | 事实 | 处理规则 |
|---|---|---|
| 源码目录 | `/home/wynter/myground/my_projects/Reading-Improving` | 本次操作的唯一项目目录 |
| GitHub 远端 | `git@github.com:Wynterrrrr/Reading-Improving.git`，默认分支 `main` | 本次通过结构检查后提交并推送 |
| 当前执行环境 | 本机 WSL2，而非已验证可登录的远端 Ubuntu | 不得声称已在远端部署；远端连接信息另行确认 |
| Obsidian Vault | 原 `LReading/` 数据与插件目录已删除 | 本阶段不得重新写入或部署 |

## 下一建议

等待用户选择：

1. 授权将最小插件壳复制到目标 Vault 并执行 M-01 手工验收；或
2. 明确接受 M-01 暂待确认，并授权 `LR-PHASE-02`。

在用户选择前，不进入后续阶段。