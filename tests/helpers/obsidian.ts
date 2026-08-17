import { vi } from 'vitest';

type Command = {
  id: string;
  name: string;
  callback: () => void;
};

const state = vi.hoisted(() => {
  const registeredCommands: Command[] = [];
  const noticeSpy = vi.fn();

  class Plugin {
    addCommand(command: Command): void {
      registeredCommands.push(command);
    }

    registerView(): void {}

    registerEvent(): void {}

    addSettingTab(): void {}

    async loadData(): Promise<null> {
      return null;
    }

    async saveData(): Promise<void> {}
  }

  class Notice {
    constructor(message: string) {
      noticeSpy(message);
    }
  }

  return { Plugin, Notice, noticeSpy, registeredCommands };
});

vi.mock('obsidian', () => ({
  Plugin: state.Plugin,
  Notice: state.Notice,
}));

export const { noticeSpy, registeredCommands } = state;

export function resetObsidianMock(): void {
  registeredCommands.length = 0;
  noticeSpy.mockReset();
}
