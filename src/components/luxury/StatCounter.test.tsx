import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCounter from './StatCounter';

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

describe('StatCounter', () => {
  it('renders label and suffix', () => {
    render(<StatCounter value={100} suffix="%" label="Natural Fibres" />);
    expect(screen.getByText('Natural Fibres')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
  });

  it('starts counting from 0', () => {
    render(<StatCounter value={48} label="Artisans" />);
    expect(screen.getByTestId('stat-value').textContent).toBe('0');
  });
});
