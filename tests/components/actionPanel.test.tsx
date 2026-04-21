import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ActionPanel } from '../../src/components/panels/ActionPanel';
import { useSceneStore } from '../../src/store/sceneStore';

describe('ActionPanel', () => {
  it('enables undo after a committed scene change', async () => {
    const user = userEvent.setup();
    useSceneStore.getState().resetScene();
    useSceneStore.getState().addPrimitive('sphere');

    render(<ActionPanel />);
    await user.click(screen.getByRole('button', { name: /undo/i }));

    expect(useSceneStore.getState().history.present.primitives).toHaveLength(0);
  });

  it('exports a png using the provided canvas getter', async () => {
    const user = userEvent.setup();
    const canvas = document.createElement('canvas');
    const toDataUrl = vi.fn(() => 'data:image/png;base64,mock');
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    Object.defineProperty(canvas, 'toDataURL', {
      configurable: true,
      value: toDataUrl,
    });

    render(<ActionPanel getCanvas={() => canvas} />);
    await user.click(screen.getByRole('button', { name: /export png/i }));

    expect(toDataUrl).toHaveBeenCalledWith('image/png', 0.92);
    click.mockRestore();
  });
});
