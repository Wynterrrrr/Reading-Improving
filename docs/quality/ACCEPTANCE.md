# 验收策略与清单

<!-- LR-ANCHOR:ACCEPTANCE -->

本文件定义“什么叫完成”。自动化通过不等于 Obsidian 实际体验已确认；所有手工步骤都必须由用户或可验证的真实运行时证据确认。

## 1. 测试层级

| 层级 | 目标 | 工具 / 位置 | 何时开始 |
|---|---|---|---|
| Unit | 纯领域规则：路径、ID、标签、Markdown、重导入 | Vitest，`tests/unit/` | PHASE-01 |
| Component / Adapter | EPUB fixture、Vault adapter、应用用例 | Vitest，`tests/integration/` | PHASE-02 |
| Smoke | manifest、插件 load/unload、命令注册 | Vitest，`tests/smoke/` | PHASE-01 |
| Static | lint、typecheck、构建、无敏感文件 | npm scripts | PHASE-01 起 |
| Manual | Obsidian 真正加载、主题、文件选择、阅读与回链 | 用户操作 | PHASE-01 起 |

## 2. 真实样书与测试 fixture 规则

- 禁止将真实 EPUB、受版权保护的段落、真实书名、下载来源、用户笔记、API Key 写入仓库。
- `fixtures/` 只允许自写的极小 EPUB/HTML/XML 测试材料，或确认可再分发的公开材料。
- fixture 必须在文件头说明来源、许可、用途和最小覆盖行为。
- 真实样书只能由用户在本地手工验收；结果以“通过/失败、现象、版本”记录，不上传正文。

## 3. 通用质量门禁

从 PHASE-01 起，所有开发阶段结束前执行：

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

附加规则：

```bash
git diff --check
# 发布前阶段还需：npm run check:release
```

所有命令必须实际执行且退出码为 0；若尚未创建命令，状态应是 `blocked`，不能记为通过。

## 4. 用户手工验收清单

### M-01 插件加载（PHASE-01）

- [ ] `manifest.json` 能被 Obsidian 识别。
- [ ] 插件开启后没有启动错误。
- [ ] 命令面板能发现最小占位命令。
- [ ] 卸载/重载后无错误。

### M-02 EPUB 导入与可读性（PHASE-05）

- [ ] 选择真实的无 DRM EPUB 后，先显示导入预览，确认前 Vault 无写入。
- [ ] 确认后生成 `书籍.md`、`目录.md`、`阅读笔记与摘要.md`、章节、资源。
- [ ] 目录能跳转到正确章节。
- [ ] 正文、列表、引用、图片在浅色与深色主题都可读。
- [ ] 无远程脚本执行或网络资源请求。

### M-03 选区记录与回链（PHASE-06）

- [ ] 在章节选一段文字，创建 `quote`、`note`、`summary` 和 `question` 中至少两种。
- [ ] 预览显示正确章节、原文摘录和将追加的 Markdown。
- [ ] 确认后只追加到 `阅读笔记与摘要.md`。
- [ ] 点击位置链接可准确回到原段落。
- [ ] 重新打开 Obsidian 后链接仍有效。

### M-04 资料目录与标签（PHASE-07 / 08）

- [ ] 至少导入两本书，书架只显示完整导入的书。
- [ ] 资料目录能按书籍、阅读记录类型、书籍标签导航。
- [ ] 修改书籍标签预览准确，用户 tags 未丢失。
- [ ] 默认操作不在章节中复制书籍标签。
- [ ] 选择批量物化时，影响范围与撤销/恢复说明可见。

### M-05 重导入与恢复（PHASE-09 / 10）

- [ ] 相同 EPUB 不产生重复书籍/章节。
- [ ] 不同版本 EPUB 显示明确的三种选择。
- [ ] 更新派生内容前有备份提示。
- [ ] 无法映射的笔记位置明确标为需复核，不跳到错误段落。
- [ ] 阅读笔记原文没有被覆盖。

## 5. 发布前隐私与恢复验收（LR-CHECK-10）

- [ ] Git 追踪文件不含真实 EPUB、书籍正文、Vault 运行数据、API Key、绝对用户路径或下载来源。
- [ ] `.gitignore` 覆盖 `node_modules/`、构建产物、coverage、真实 fixture、Vault 部署目录。
- [ ] 在临时 Vault 使用合成 fixture 导入、写一条笔记、重导入、验证回链。
- [ ] release 检查脚本输出真实结果。
- [ ] 所有待用户确认项在 README/STATUS 中明确列出，未伪装为完成。
