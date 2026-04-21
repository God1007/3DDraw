import { render } from '@testing-library/react';
import App from '../../src/App';

describe('SceneCanvas shell', () => {
  it('mounts the interactive canvas shell inside the workspace', () => {
    const { container } = render(<App />);

    expect(container.querySelector('.canvas-shell')).toBeInTheDocument();
  });
});
