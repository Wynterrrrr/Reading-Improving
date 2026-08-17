# 合成 EPUB fixtures

本目录不保存真实书籍、下载内容或用户 EPUB。`LR-PHASE-03` 的测试材料均由测试代码在内存中生成，内容只使用项目自写的短文本。

## 覆盖目标

| fixture / 变体 | 唯一覆盖行为 |
|---|---|
| 最小单章 EPUB3 | `container.xml → OPF → spine` 的正常链路 |
| 双章 EPUB3 + nav | spine 顺序、嵌套 TOC、相对 href 规范化 |
| 脚本 XHTML | 删除 script、事件属性、iframe、远程资源 |
| 缺 container / 缺 OPF / 坏 XML / ghost spine | 分类错误与 warnings |
| 恶意 ZIP entry | 在解压前拒绝路径穿越、超量、压缩比异常 |

所有人类可读字符串均为测试专用，不能替换为真实书名、书摘、作者信息或下载来源。