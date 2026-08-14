# src/

本目录在 `LR-PHASE-01` 前必须保持**没有 TypeScript/JavaScript 生产实现**。

未来目录边界见 `docs/ARCHITECTURE.md`：

- `domain/`：纯 TypeScript 规则，禁止依赖 Obsidian/Electron/DOM/主机文件系统；
- `application/`：用例与 ports；
- `infrastructure/`：EPUB、Vault、Obsidian 适配器；
- `ui/`：命令、Modal、ItemView、主题 CSS 交互。

在用户明确授权 `LR-PHASE-01` 前，不得在本目录创建实现文件。