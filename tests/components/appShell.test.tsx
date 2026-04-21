import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/App';

describe('AppShell', () => {
  it('switches tools and colors from the sidebar', async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole('button', { name: /crayon/i }));
    await user.click(screen.getByRole('button', { name: /purple/i }));

    expect(screen.getByRole('button', { name: /crayon/i })).toHaveAttribute('data-active', 'true');
    expect(screen.getByLabelText(/selected color/i)).toHaveStyle({ background: '#8e6ad8' });
  });
});
