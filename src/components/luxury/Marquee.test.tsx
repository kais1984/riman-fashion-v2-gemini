import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Marquee from './Marquee';

describe('Marquee', () => {
  it('renders items duplicated for seamless loop', () => {
    const { container } = render(<Marquee items={['RIMAN', 'COUTURE']} />);
    const track = container.querySelector('.marquee-track');
    expect(track).toBeInTheDocument();
    // each item appears twice (two identical halves for the -50% loop)
    expect(track!.textContent).toBe('RIMAN◆COUTURE◆RIMAN◆COUTURE◆');
  });

  it('applies custom className', () => {
    const { container } = render(<Marquee items={['A']} className="my-class" />);
    expect(container.firstChild).toHaveClass('my-class');
  });
});
