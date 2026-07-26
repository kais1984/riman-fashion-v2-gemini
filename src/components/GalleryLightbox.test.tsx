import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GalleryLightbox from './GalleryLightbox';
import type { GalleryItem } from '../hooks/useGallery';

const mockItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Test Photo',
    description: '',
    category: 'bridal',
    media_url: '/assets/test.jpg',
    media_type: 'photo',
    thumbnail_url: '',
    sort_order: 0,
    is_featured: false,
    created_at: '2026-01-01',
  },
  {
    id: '2',
    title: 'Test Video',
    description: '',
    category: 'evening',
    media_url: '/assets/test.mp4',
    media_type: 'video',
    thumbnail_url: '',
    sort_order: 1,
    is_featured: false,
    created_at: '2026-01-02',
  },
];

describe('GalleryLightbox', () => {
  it('renders nothing when closed', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={false}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.queryByLabelText('Close lightbox')).toBeNull();
  });

  it('renders when open', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.getByText('Test Photo')).toBeDefined();
    expect(screen.getByText('1 / 2')).toBeDefined();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={onClose}
        onNavigate={vi.fn()}
      />
    );
    fireEvent.click(screen.getByLabelText('Close lightbox'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onNavigate when next button is clicked', () => {
    const onNavigate = vi.fn();
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={onNavigate}
      />
    );
    fireEvent.click(screen.getByLabelText('Next item'));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it('does not render prev button on first item', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.queryByLabelText('Previous item')).toBeNull();
  });

  it('does not render next button on last item', () => {
    render(
      <GalleryLightbox
        items={mockItems}
        currentIndex={1}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );
    expect(screen.queryByLabelText('Next item')).toBeNull();
  });
});
