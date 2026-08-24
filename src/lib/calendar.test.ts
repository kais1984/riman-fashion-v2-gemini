import { describe, it, expect } from 'vitest';
import { addDays, parseISO, setDate, startOfMonth } from 'date-fns';
import { buildMonthMatrix, clampToMonth, isUnavailable, isoKey, nextAvailableDate } from './calendar';

const TODAY = new Date(2026, 7, 24);

describe('isoKey', () => {
  it('formats local dates as yyyy-MM-dd', () => {
    expect(isoKey(new Date(2026, 8, 4))).toBe('2026-09-04');
  });
});

describe('buildMonthMatrix', () => {
  it('pads to whole weeks starting Sunday', () => {
    const weeks = buildMonthMatrix(new Date(2026, 8, 15));
    expect(weeks.length).toBeGreaterThanOrEqual(5);
    for (const week of weeks) {
      expect(week).toHaveLength(7);
      expect(week[0].getDay()).toBe(0);
    }
    const first = weeks[0][0];
    const last = weeks[weeks.length - 1][6];
    expect(first.getTime()).toBeLessThanOrEqual(startOfMonth(new Date(2026, 8, 15)).getTime());
    expect(last.getDay()).toBe(6);
  });
});

describe('isUnavailable', () => {
  it('flags strictly-past days, not today', () => {
    expect(isUnavailable(addDays(TODAY, -1), new Set(), TODAY)).toBe(true);
    expect(isUnavailable(TODAY, new Set(), TODAY)).toBe(false);
  });
  it('flags booked days', () => {
    expect(isUnavailable(new Date(2026, 8, 10), new Set(['2026-09-10']), TODAY)).toBe(true);
    expect(isUnavailable(new Date(2026, 8, 11), new Set(['2026-09-10']), TODAY)).toBe(false);
  });
});

describe('nextAvailableDate', () => {
  it('returns the first open day scanning forward', () => {
    const booked = ['2026-08-24', '2026-08-25'];
    expect(nextAvailableDate(booked, TODAY)).toBe('2026-08-26');
  });
  it('returns today when free', () => {
    expect(nextAvailableDate([], TODAY)).toBe('2026-08-24');
  });
  it('returns null when the horizon is exhausted', () => {
    const far = Array.from({ length: 31 }, (_, i) => isoKey(addDays(TODAY, i)));
    expect(nextAvailableDate(far, TODAY, 30)).toBeNull();
  });
});

describe('clampToMonth', () => {
  it('clamps day-of-month into shorter months', () => {
    const march31 = new Date(2026, 2, 31);
    expect(clampToMonth(new Date(2026, 1, 1), march31)).toEqual(setDate(startOfMonth(new Date(2026, 1, 1)), 28));
  });
  it('keeps the same day when it fits', () => {
    expect(clampToMonth(parseISO('2026-09-01'), new Date(2026, 7, 24))).toEqual(parseISO('2026-09-24'));
  });
});
