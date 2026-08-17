import { beforeEach, describe, expect, it } from 'vitest';
import { noticeSpy, registeredCommands, resetObsidianMock } from '../helpers/obsidian';

import ReadingImprovingPlugin from '../../src/main';

describe('ReadingImprovingPlugin lifecycle', () => {
  beforeEach(() => {
    resetObsidianMock();
  });

  it('loads, registers the library placeholder command, and unloads synchronously', () => {
    const plugin = new ReadingImprovingPlugin({} as never, {} as never);

    expect(() => plugin.onload()).not.toThrow();
    expect(registeredCommands).toContainEqual(expect.objectContaining({
      id: 'lreading-open-library',
      name: '打开阅读库',
    }));
    expect(() => plugin.onunload()).not.toThrow();
  });

  it('shows the phase-one placeholder notice when the command runs', () => {
    const plugin = new ReadingImprovingPlugin({} as never, {} as never);
    plugin.onload();

    const command = registeredCommands.find(({ id }) => id === 'lreading-open-library');
    expect(command).toBeDefined();

    expect(() => command?.callback()).not.toThrow();
    expect(noticeSpy).toHaveBeenCalledWith('阅读库功能将在后续阶段实现。');
  });
});
