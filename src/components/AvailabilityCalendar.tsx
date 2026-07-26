import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isBefore, startOfToday, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { fetchBookedDates } from '../services/rentals';

interface AvailabilityCalendarProps {
  productId?: string;
  bookedDates?: Date[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
}

export default function AvailabilityCalendar({ productId, bookedDates: initialBookedDates = [], onDateSelect, selectedDate }: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Date[]>(initialBookedDates);
  const [loading, setLoading] = useState(false);
  const today = startOfToday();

  useEffect(() => {
    if (productId) {
      setLoading(true);
      fetchBookedDates(productId)
        .then(dates => {
          setBookedDates(dates.map(d => parseISO(d)));
        })
        .catch(() => {
          setBookedDates(initialBookedDates);
        })
        .finally(() => setLoading(false));
    }
  }, [productId]);

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-2 mb-6">
        <span className="font-heading text-lg text-stone-800 uppercase tracking-widest">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-1 hover:text-gold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-1 hover:text-gold transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map(day => (
          <div key={day} className="text-[8px] font-bold text-stone-400 uppercase tracking-widest text-center py-2">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <div className="grid grid-cols-7 gap-px bg-stone-100 border border-stone-100">
        {calendarDays.map((date, i) => {
          const isBooked = bookedDates.some(booked => isSameDay(booked, date));
          const isPast = isBefore(date, today);
          const isCurrentMonth = isSameMonth(date, monthStart);
          const isSelected = selectedDate && isSameDay(date, selectedDate);

          return (
            <div
              key={i}
              onClick={() => !isBooked && !isPast && isCurrentMonth && onDateSelect?.(date)}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center text-[10px] transition-all bg-ivory",
                loading && "opacity-50",
                !isCurrentMonth && "text-stone-200",
                (isBooked || isPast) && isCurrentMonth && "bg-stone-50 text-stone-300 cursor-not-allowed",
                isCurrentMonth && !isBooked && !isPast && "hover:bg-ivory cursor-pointer text-stone-700",
                isSelected && "bg-gold text-white hover:bg-gold-dark"
              )}
            >
              <span>{format(date, 'd')}</span>
              {isBooked && isCurrentMonth && (
                <div className="absolute bottom-1 w-1 h-1 bg-stone-200 rounded-full" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-ivory p-4">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <div className="mt-6 flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-gold rounded-full" />
          <span className="text-[8px] uppercase tracking-widest text-stone-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-stone-100 rounded-full" />
          <span className="text-[8px] uppercase tracking-widest text-stone-400">Booked</span>
        </div>
      </div>
    </div>
  );
}