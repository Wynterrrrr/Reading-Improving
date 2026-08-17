import { Notice, Plugin } from 'obsidian';

export default class ReadingImprovingPlugin extends Plugin {
  onload(): void {
    this.addCommand({
      id: 'lreading-open-library',
      name: '打开阅读库',
      callback: () => {
        new Notice('阅读库功能将在后续阶段实现。');
      },
    });
  }

  onunload(): void {}
}
