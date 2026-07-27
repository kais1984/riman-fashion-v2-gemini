import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import WordReveal from './WordReveal';
import { LanguageProvider } from '../../contexts/LanguageContext';

beforeAll(() => {
  // motion's useScroll needs IntersectionObserver in jsdom
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

describe('WordReveal', () => {
  it('splits latin text into word spans', () => {
    const { container } = render(
      <LanguageProvider>
        <WordReveal text="Cut less and cut better" />
      </LanguageProvider>
    );
    const words = container.querySelectorAll('[data-word]');
    expect(words.length).toBe(5);
    expect(container.textContent).toContain('Cut');
    expect(container.textContent).toContain('better');
  });
});
