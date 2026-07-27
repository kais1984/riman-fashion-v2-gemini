import { cn } from '../../lib/utils';

interface MarqueeProps {
  items: string[];
  className?: string;
}

export default function Marquee({ items, className }: MarqueeProps) {
  const half = (
    <>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-10 pr-10">
          <span>{item}</span>
          <span className="text-gold" aria-hidden="true">◆</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className={cn(
        'overflow-hidden select-none border-y border-gold/20 bg-onyx py-4',
        className
      )}
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max">
        <div className="flex items-center text-[11px] uppercase tracking-[0.35em] whitespace-nowrap text-ivory/80">
          {half}
        </div>
        <div className="flex items-center text-[11px] uppercase tracking-[0.35em] whitespace-nowrap text-ivory/80">
          {half}
        </div>
      </div>
    </div>
  );
}
