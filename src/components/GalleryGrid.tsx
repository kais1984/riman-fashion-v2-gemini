import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, Image as ImageIcon } from 'lucide-react';
import type { GalleryItem } from '../hooks/useGallery';

interface GalleryGridProps {
  items: GalleryItem[];
  onItemClick: (item: GalleryItem, index: number) => void;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return prefersReduced;
}

function GalleryVideoItem({ item, onClick, index }: { item: GalleryItem; onClick: () => void; index: number; key?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold: [0.3] }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid mb-4 relative group cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <video
        ref={videoRef}
        src={item.media_url}
        poster={item.thumbnail_url || undefined}
        muted
        loop
        playsInline
        preload="metadata"
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/30 transition-colors duration-300" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-4 h-4 text-white fill-white" />
        <span className="text-white text-[10px] tracking-widest uppercase font-bold">{item.title}</span>
      </div>
    </motion.div>
  );
}

function GalleryPhotoItem({ item, onClick, index }: { item: GalleryItem; onClick: () => void; index: number; key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="break-inside-avoid mb-4 relative group cursor-pointer overflow-hidden"
      onClick={onClick}
    >
      <img
        src={item.media_url}
        alt={item.title}
        loading="lazy"
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/30 transition-colors duration-300" />
      <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ImageIcon className="w-4 h-4 text-white" />
        <span className="text-white text-[10px] tracking-widest uppercase font-bold">{item.title}</span>
      </div>
    </motion.div>
  );
}

export default function GalleryGrid({ items, onItemClick }: GalleryGridProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
      {items.map((item, index) =>
        item.media_type === 'video' ? (
          <GalleryVideoItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item, index)}
            index={index}
          />
        ) : (
          <GalleryPhotoItem
            key={item.id}
            item={item}
            onClick={() => onItemClick(item, index)}
            index={index}
          />
        )
      )}
    </div>
  );
}
