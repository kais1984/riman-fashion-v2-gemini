import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalErrorBoundary from './GlobalErrorBoundary';

describe('GlobalErrorBoundary', () => {
  it('renders the fallback without any providers when a child throws', () => {
    function Bomb(): never {
      throw new Error('boom');
    }
    render(
      <GlobalErrorBoundary>
        <Bomb />
      </GlobalErrorBoundary>
    );
    expect(screen.getByText('A Technical Moment')).toBeInTheDocument();
  });
});
