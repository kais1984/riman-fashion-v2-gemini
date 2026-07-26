import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryFilters from './GalleryFilters';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '../contexts/LanguageContext';

function renderWithProviders(ui: import('react').ReactElement) {
  return render(
    <LanguageProvider>
      <BrowserRouter>{ui}</BrowserRouter>
    </LanguageProvider>
  );
}

describe('GalleryFilters', () => {
  it('renders all category buttons', () => {
    renderWithProviders(
      <GalleryFilters activeCategory="all" onCategoryChange={vi.fn()} />
    );
    expect(screen.getByText('All')).toBeDefined();
    expect(screen.getByText('Bridal')).toBeDefined();
    expect(screen.getByText('Evening')).toBeDefined();
    expect(screen.getByText('Jewelry')).toBeDefined();
  });

  it('calls onCategoryChange when a filter is clicked', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <GalleryFilters activeCategory="all" onCategoryChange={onChange} />
    );
    fireEvent.click(screen.getByText('Bridal'));
    expect(onChange).toHaveBeenCalledWith('bridal');
  });

  it('highlights the active category', () => {
    renderWithProviders(
      <GalleryFilters activeCategory="bridal" onCategoryChange={vi.fn()} />
    );
    const bridalBtn = screen.getByText('Bridal');
    expect(bridalBtn.closest('button')).toHaveClass('bg-gold');
  });
});
