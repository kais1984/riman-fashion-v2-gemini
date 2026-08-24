import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { addDays, addMonths, subMonths, startOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isBefore, startOfToday, format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchBookedDates } from '../services/rentals';
import { useLanguage } from '../contexts/LanguageContext';
import { buildMonthMatrix, clampToMonth, isUnavailable, isoKey, nextAvailableDate } from '../lib/calendar';

interface AvailabilityCalendarProps {
  productId?: string;
  bookedDates?: Date[];
  onDateSelect?: (date: Date | null) => void;
  selectedDate?: Date | null;
}

export default function AvailabilityCalendar({ productId, bookedDates: initialBookedDates = [], onDateSelect, selectedDate }: AvailabilityCalendarProps) {
  const today = startOfToday();
  const { t, isRtl } = useLanguage();
  const months = t('calendar.months').split(',');
  const dayNames = t('calendar.days').split(',');
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const [currentMonth, setCurrentMonth] = useState<Date>(() => today);
  const [bookedIso, setBookedIso] = useState<string[]>(() => initialBookedDates.map(isoKey));
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);
  const [focusedDate, setFocusedDate] = useState<Date>(() => today);
  const [announcement, setAnnouncement] = useState('');
  const gridRef = useRef<HTMLDivElement>(null);
  const interactedRef = useRef(false);
  const selectedRef = useRef(selectedDate);
  selectedRef.current = selectedDate;

  const load = useCallback(() => {
    if (!productId) return;
    setLoading(true);
    setStale(false);
    fetchBookedDates(productId)
      .then(dates => {
        setBookedIso(dates);
        if (selectedRef.current && dates.includes(isoKey(selectedRef.current))) {
          onDateSelect?.(null);
          setAnnouncement(t('calendar.statusBooked'));
        }
      })
      .catch(() => setStale(true))
      .finally(() => setLoading(false));
  }, [productId, onDateSelect, t]);

  useEffect(() => { load(); }, [load]);

  const bookedSet = useMemo(() => new Set(bookedIso), [bookedIso]);
  const canSelect = useCallback(
    (d: Date) => isSameMonth(d, currentMonth) && !isUnavailable(d, bookedSet, today),
    [currentMonth, bookedSet, today]
  );

  useEffect(() => {
    if (!interactedRef.current) return;
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${isoKey(focusedDate)}"]`);
    el?.focus();
  }, [focusedDate, currentMonth]);

  const describe = useCallback(
    (d: Date) => `${dayNames[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    [dayNames, months]
  );

  const goToMonth = (delta: number) => {
    const next = delta < 0 ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1);
    setCurrentMonth(next);
    setFocusedDate(clampToMonth(next, focusedDate));
    setAnnouncement(`${months[next.getMonth()]} ${next.getFullYear()}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const dir = isRtl ? -1 : 1;
    let next: Date | undefined;
    let nextMonth: Date | undefined;
    switch (e.key) {
      case 'ArrowUp': next = addDays(focusedDate, -7); break;
      case 'ArrowDown': next = addDays(focusedDate, 7); break;
      case 'ArrowLeft': next = addDays(focusedDate, -dir); break;
      case 'ArrowRight': next = addDays(focusedDate, dir); break;
      case 'Home': next = startOfWeek(focusedDate); break;
      case 'End': next = endOfWeek(focusedDate); break;
      case 'PageUp': nextMonth = subMonths(currentMonth, 1); break;
      case 'PageDown': nextMonth = addMonths(currentMonth, 1); break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        interactedRef.current = true;
        if (!canSelect(focusedDate)) {
          setAnnouncement(describe(focusedDate));
          return;
        }
        onDateSelect?.(focusedDate);
        setAnnouncement(`${t('calendar.selectedPrefix')} ${describe(focusedDate)}`);
        return;
      default: return;
    }
    e.preventDefault();
    interactedRef.current = true;
    if (nextMonth) {
      setCurrentMonth(nextMonth);
      setFocusedDate(clampToMonth(nextMonth, focusedDate));
      setAnnouncement(`${months[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`);
    } else if (next) {
      if (!isSameMonth(next, currentMonth)) setCurrentMonth(startOfMonth(next));
      setFocusedDate(next);
    }
  };

  const jumpToNextAvailable = () => {
    interactedRef.current = true;
    const found = nextAvailableDate([...bookedSet], today);
    if (!found) {
      setAnnouncement(t('calendar.noAvailability'));
      return;
    }
    const [y, m, d] = found.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    setCurrentMonth(startOfMonth(date));
    setFocusedDate(date);
    onDateSelect?.(date);
    setAnnouncement(`${t('calendar.nextAvailable')}: ${describe(date)}`);
  };

  const weeks = useMemo(() => buildMonthMatrix(currentMonth), [currentMonth]);
  const headingId = 'availability-month';

  return (
    <div className="bg-ivory p-4">
      <div className="flex items-center justify-between px-2 mb-4">
        <h3 id={headingId} className="font-heading text-lg text-stone-800 uppercase tracking-widest">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goToMonth(-1)}
            className="p-1 hover:text-gold transition-colors"
            aria-label={t('calendar.prev')}
          >
            <PrevIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goToMonth(1)}
            className="p-1 hover:text-gold transition-colors"
            aria-label={t('calendar.next')}
          >
            <NextIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={jumpToNextAvailable}
        className="btn-luxury-outline w-full mb-4 py-2 text-micro uppercase tracking-widest"
      >
        {t('calendar.nextAvailable')}
      </button>

      {stale && (
        <p className="mb-3 text-center text-micro text-stone-600 italic">
          {t('calendar.fallbackNotice')}{' '}
          <button type="button" onClick={load} className="underline text-gold uppercase tracking-widest">
            {t('calendar.retry')}
          </button>
        </p>
      )}

      <div className="grid grid-cols-7 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-micro font-bold text-stone-600 uppercase tracking-widest text-center py-2">
            {day}
          </div>
        ))}
      </div>

      <div
        ref={gridRef}
        role="grid"
        data-testid="availability-grid"
        aria-labelledby={headingId}
        aria-busy={loading}
        onKeyDown={handleKeyDown}
        className="grid grid-cols-7 gap-px bg-stone-100 border border-stone-100"
      >
        {weeks.map((week, wi) => (
          <div role="row" key={`w${wi}`} className="contents">
            {week.map(date => {
              const inMonth = isSameMonth(date, currentMonth);
              const past = isBefore(date, today);
              const booked = bookedSet.has(isoKey(date));
              const selectable = inMonth && !past && !booked;
              const isSelected = !!selectedDate && isSameDay(date, selectedDate);
              const statusLabel = past
                ? t('calendar.statusPast')
                : booked
                  ? t('calendar.statusBooked')
                  : t('calendar.statusAvailable');
              return (
                <div
                  role="gridcell"
                  key={isoKey(date)}
                  aria-selected={isSelected}
                  className="relative aspect-square"
                >
                  <button
                    type="button"
                    data-date={isoKey(date)}
                    tabIndex={isSameDay(date, focusedDate) ? 0 : -1}
                    aria-disabled={!selectable}
                    aria-current={isSameDay(date, today) ? 'date' : undefined}
                    aria-label={`${describe(date)}, ${statusLabel}`}
                    onFocus={() => setFocusedDate(date)}
                    onClick={() => selectable && onDateSelect?.(date)}
                    className={cn(
                      'w-full h-full flex items-center justify-center text-micro transition-all bg-ivory',
                      loading && 'animate-pulse opacity-60',
                      !inMonth && 'text-stone-200',
                      (past || booked) && inMonth && 'bg-stone-50 text-stone-500 cursor-not-allowed',
                      selectable && 'hover:bg-gold/10 cursor-pointer text-stone-700',
                      isSelected && 'bg-gold text-white hover:bg-gold'
                    )}
                  >
                    <span>{format(date, 'd')}</span>
                  </button>
                  {booked && inMonth && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-stone-400 rounded-full pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {selectedDate ? (
        <p data-testid="rental-summary" className="mt-4 text-center text-micro text-stone-700 uppercase tracking-widest">
          {t('calendar.selectedPrefix')} {describe(selectedDate)} · {t('product.rental_7day')}
        </p>
      ) : (
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-gold rounded-full" />
            <span className="text-micro uppercase tracking-widest text-stone-600">{t('calendar.available')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-stone-100 rounded-full" />
            <span className="text-micro uppercase tracking-widest text-stone-600">{t('calendar.booked')}</span>
          </div>
        </div>
      )}

      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
