interface CalligraphicAccentProps {
  word: string;
  className?: string;
}

export default function CalligraphicAccent({ word, className }: CalligraphicAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute select-none font-arabic-heading leading-none text-gold/10 ${className ?? ''}`}
    >
      {word}
    </span>
  );
}
