import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'gold';
  showText?: boolean;
}

export default function Logo({ className, variant = 'gold', showText = true }: LogoProps) {
  const colors = {
    light: 'text-white',
    dark: 'text-stone-900',
    gold: 'text-gold'
  };

  const currentColor = colors[variant];

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <svg 
        viewBox="0 0 100 100" 
        className={cn("w-full h-auto", currentColor)}
        fill="currentColor"
      >
        {/* Ornate Rope Border */}
        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" className="opacity-50" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="0.5" />
        
        {/* Filigree Pattern (Simplified Aesthetic) */}
        <path d="M50 15 C60 15 70 25 70 35 C70 45 60 55 50 55 C40 55 30 45 30 35 C30 25 40 15 50 15" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
        <path d="M50 85 C60 85 70 75 70 65 C70 55 60 45 50 45 C40 45 30 55 30 65 C30 75 40 85 50 85" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
        <path d="M15 50 C15 60 25 70 35 70 C45 70 55 60 55 50 C55 40 45 30 35 30 C25 30 15 40 15 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />
        <path d="M85 50 C85 60 75 70 65 70 C55 70 45 60 45 50 C45 40 55 30 65 30 C75 30 85 40 85 50" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-30" />

        {/* Central 'R' */}
        <text 
          x="50" 
          y="58" 
          textAnchor="middle" 
          className="font-serif text-3xl font-light"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          R
        </text>

        {/* Outer Embellishments */}
        <path d="M50 8 L52 12 L48 12 Z M50 92 L52 88 L48 88 Z M8 50 L12 52 L12 48 Z M92 50 L88 52 L88 48 Z" />
      </svg>
      
      {showText && (
        <div className="flex flex-col items-center">
          <span 
            className={cn(
              "font-heading text-lg md:text-xl tracking-[0.4em] uppercase whitespace-nowrap",
              currentColor
            )}
          >
            Riman Fashion
          </span>
          <div className={cn("w-12 h-px mt-1", variant === 'gold' ? "bg-gold/30" : "bg-current opacity-20")} />
        </div>
      )}
    </div>
  );
}
