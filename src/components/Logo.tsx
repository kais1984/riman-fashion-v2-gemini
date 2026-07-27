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
      <img 
        src="/riman-logo.png" 
        alt="Atelier Riman" 
        className="w-full h-auto object-contain"
        loading="eager"
      />
      
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
