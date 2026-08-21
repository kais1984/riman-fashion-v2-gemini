import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CalligraphicAccent from './CalligraphicAccent';

describe('CalligraphicAccent', () => {
  it('renders decorative Arabic word, hidden from assistive tech', () => {
    render(<CalligraphicAccent word="أناقة" className="text-9xl" />);
    const el = screen.getByText('أناقة');
    expect(el).toHaveAttribute('aria-hidden', 'true');
    expect(el.className).toContain('pointer-events-none');
  });
});
