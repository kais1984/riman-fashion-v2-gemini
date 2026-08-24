import { addDays, eachDayOfInterval, endOfMonth, startOfMonth, startOfWeek, endOfWeek, format, setDate, startOfToday } from 'date-fns';

export function isoKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function buildMonthMatrix(month: Date): Date[][] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

function midnight(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function isUnavailable(date: Date, bookedSet: Set<string>, today: Date): boolean {
  return midnight(date) < midnight(today) || bookedSet.has(isoKey(date));
}

export function nextAvailableDate(bookedIso: string[], from?: Date, horizonDays = 180): string | null {
  const booked = new Set(bookedIso);
  const start = from ?? startOfToday();
  for (let i = 0; i <= horizonDays; i++) {
    const key = isoKey(addDays(start, i));
    if (!booked.has(key)) return key;
  }
  return null;
}

export function clampToMonth(month: Date, daySource: Date): Date {
  const target = startOfMonth(month);
  const day = Math.min(daySource.getDate(), endOfMonth(target).getDate());
  return setDate(target, day);
}
