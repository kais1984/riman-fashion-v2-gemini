import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import ImmersiveUI from './ImmersiveUI';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../hooks/useFeature', () => ({
  useFeature: () => true,
}));

describe('ImmersiveUI preloader', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('shows preloader on first visit (jsdom path is /)', () => {
    const { container } = render(
      <BrowserRouter>
        <ImmersiveUI />
      </BrowserRouter>
    );
    expect(container.querySelector('[data-preloader]')).not.toBeNull();
  });

  it('does not show preloader when already shown this session', () => {
    sessionStorage.setItem('riman_preloader_shown', '1');
    const { container } = render(
      <BrowserRouter>
        <ImmersiveUI />
      </BrowserRouter>
    );
    expect(container.querySelector('[data-preloader]')).toBeNull();
  });
});
