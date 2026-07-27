import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MagneticButton from './MagneticButton';

describe('MagneticButton', () => {
  it('renders children', () => {
    render(<MagneticButton><button>Click me</button></MagneticButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<MagneticButton className="wrap">x</MagneticButton>);
    expect(container.firstChild).toHaveClass('wrap');
  });
});
