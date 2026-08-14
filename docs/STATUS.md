# LReading 状态账本

<!-- LR-ANCHOR:STATUS-LEDGER -->

> 本文件是项目实施状态的唯一事实来源。计划文件描述“应做什么”，本文件记录“实际做了什么”。不得编造命令输出、提交、部署或人工验收结果。

## 当前结论

- 最后更新：2026-08-14
- 项目状态：**文档骨架已完成且已通过结构自检；业务实现尚未开始。**
- 已完成：`LR-PHASE-00`（仅项目骨架、架构、契约与施工计划）。
- 下一个可执行阶段：`LR-PHASE-01`（工具链与最小插件壳）。
- 尚未进行：依赖安装、TypeScript 实现、测试运行（除结构自检）、Vault 部署、真实 EPUB 导入。
- 仓库动作：已克隆 GitHub 仓库 `Wynterrrrr/Reading-Improving`；本次文档提交尚待创建并推送至 `main`。
- 关键设计确认：无 `数据摘要.md`；统计仅为后续可重建的 UI/索引信息，不产生第二份 Markdown 数据源。

## 阶段账本

状态词只能为：`blocked`、`ready`、`in_progress`、`review`、`done`、`deferred`。

| 阶段 | 名称 | 状态 | 前置 | 自动验收 | 用户手工验收 |
|---|---|---:|---|---|---|
| LR-PHASE-00 | 文档骨架与契约冻结 | done | — | `LR-CHECK-00` 通过 | 不需要 |
| LR-PHASE-01 | 工具链与最小插件壳 | ready | 00 | `LR-CHECK-01` | 插件可加载 |
| LR-PHASE-02 | 核心领域模型与 Vault 安全边界 | blocked | 01 | `LR-CHECK-02` | 不需要 |
| LR-PHASE-03 | EPUB 解析与规范化中间模型 | blocked | 02 | `LR-CHECK-03` | 不需要 |
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
- 手工验证：不需要。
- 偏离：无。为避免检查器把“明确不创建数据摘要”的文档表述误判为产物，检查器按文件名是否实际存在来验证，而不是禁止文档文字出现该名称。
- 风险与未决项：本地仓库尚未提交/推送；未获得执行 PHASE-01 的授权。
- 下一建议：提交并推送本次文档骨架；之后等待用户审核或明确授权 `LR-PHASE-01`。

## 环境与遗留

| 项目 | 事实 | 处理规则 |
|---|---|---|
| 源码目录 | `/home/wynter/myground/my_projects/Reading-Improving` | 本次操作的唯一项目目录 |
| GitHub 远端 | `git@github.com:Wynterrrrr/Reading-Improving.git`，默认分支 `main` | 本次通过结构检查后提交并推送 |
| 当前执行环境 | 本机 WSL2，而非已验证可登录的远端 Ubuntu | 不得声称已在远端部署；远端连接信息另行确认 |
| Obsidian Vault | 原 `LReading/` 数据与插件目录已删除 | 本阶段不得重新写入或部署 |

## 下一建议

先完成 `LR-CHECK-00`，提交并推送文档骨架。之后等待用户审核；若认可，用户应明确说：

```text
执行 LR-PHASE-01
```

届时只执行工具链与最小插件壳，不导入 EPUB，不创建阅读笔记 UI，不部署到 Vault。