import { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { GalleryItem } from '../hooks/useGallery';

interface GalleryLightboxProps {
  items: GalleryItem[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function GalleryLightbox({ items, currentIndex, isOpen, onClose, onNavigate }: GalleryLightboxProps) {
  const currentItem = items[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      onNavigate(currentIndex + 1);
    }
  }, [currentIndex, items.length, onNavigate]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  }, [currentIndex, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowRight':
          goNext();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case ' ':
          e.preventDefault();
          const video = document.querySelector('.lightbox-video') as HTMLVideoElement;
          if (video) {
            video.paused ? video.play() : video.pause();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, goNext, goPrev]);

  if (!currentItem) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[1000] bg-onyx/95 flex flex-col items-center justify-center"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-6 right-6 z-[1001] text-white/60 hover:text-gold transition-colors"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Counter */}
          <div className="absolute top-6 left-6 z-[1001] text-white/40 text-xs tracking-[0.3em] uppercase">
            {currentIndex + 1} / {items.length}
          </div>

          {/* Previous button */}
          {currentIndex > 0 && (
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-4 md:left-8 z-[1001] text-white/40 hover:text-gold transition-colors"
              aria-label="Previous item"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Next button */}
          {currentIndex < items.length - 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-4 md:right-8 z-[1001] text-white/40 hover:text-gold transition-colors"
              aria-label="Next item"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}

          {/* Media */}
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="max-w-[90vw] max-h-[85vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentItem.media_type === 'video' ? (
              <video
                src={currentItem.media_url}
                controls
                autoPlay
                muted
                className="lightbox-video max-w-full max-h-[85vh] object-contain"
              />
            ) : (
              <img
                src={currentItem.media_url}
                alt={currentItem.title}
                className="max-w-full max-h-[85vh] object-contain"
              />
            )}
          </motion.div>

          {/* Caption */}
          <div className="absolute bottom-6 left-0 right-0 text-center z-[1001]">
            <h3 className="text-white font-heading text-lg tracking-widest uppercase mb-1">
              {currentItem.title}
            </h3>
            <p className="text-gold text-[10px] tracking-[0.3em] uppercase">
              {currentItem.category.replace('_', ' ')}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
