# tests/

本目录在 `LR-PHASE-01` 前必须保持**没有实际测试实现**。

未来建议布局：

```text
tests/
├── smoke/         # manifest / plugin lifecycle / command registration
├── unit/          # 纯领域规则
├── integration/   # EPUB fixture、Vault adapter、应用用例
└── helpers/       # Obsidian mocks、合成数据构造器
```

所有新增生产行为必须先有一个实际运行并正确失败的测试，再编写最小实现。禁止将真实 EPUB、真实书籍段落、用户笔记或 API Key 放入测试。