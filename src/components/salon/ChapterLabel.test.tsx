import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '../../contexts/LanguageContext';
import ChapterLabel from './ChapterLabel';

describe('ChapterLabel', () => {
  beforeEach(() => {
    localStorage.setItem('riman_lang', 'en');
  });

  it('renders numeral and translated chapter title', () => {
    render(
      <LanguageProvider>
        <ChapterLabel numeral="I" titleKey="chapter.atelier" />
      </LanguageProvider>
    );
    expect(screen.getByText('I')).toBeInTheDocument();
    expect(screen.getByText("L'Atelier")).toBeInTheDocument();
  });
});
