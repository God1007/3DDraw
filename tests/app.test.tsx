import { render, screen } from '@testing-library/react';
import App from '../src/App';

describe('App', () => {
  it('renders the app title and workspace region', () => {
    render(<App />);

    expect(screen.getByText(/3D Crayon Modeler/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/workspace/i)).toBeInTheDocument();
  });
});
