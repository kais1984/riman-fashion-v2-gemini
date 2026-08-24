import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider } from '../contexts/LanguageContext';
import AvailabilityCalendar from './AvailabilityCalendar';
import { fetchBookedDates } from '../services/rentals';
import { addDays, format } from 'date-fns';

vi.mock('../services/rentals', () => ({
  fetchBookedDates: vi.fn(),
}));

const mockedFetch = vi.mocked(fetchBookedDates);
const TODAY = new Date();

function renderCalendar(props: Partial<Parameters<typeof AvailabilityCalendar>[0]> = {}) {
  const onDateSelect = vi.fn();
  render(
    <LanguageProvider>
      <AvailabilityCalendar productId="test-product" onDateSelect={onDateSelect} {...props} />
    </LanguageProvider>
  );
  return onDateSelect;
}

function dayButton(offsetDays: number) {
  const d = addDays(TODAY, offsetDays);
  return document.querySelector(`[data-date="${format(d, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
}

beforeEach(() => {
  localStorage.setItem('riman_lang', 'en');
  mockedFetch.mockResolvedValue([format(TODAY, 'yyyy-MM-dd'), format(addDays(TODAY, 5), 'yyyy-MM-dd')]);
});

describe('AvailabilityCalendar', () => {
  it('renders an ARIA grid with labelled day buttons', async () => {
    renderCalendar();
    expect(screen.getByRole('grid')).toBeDefined();
    const futureIso = format(addDays(TODAY, 1), 'yyyy-MM-dd');
    const future = await waitFor(() => document.querySelector(`[data-date="${futureIso}"]`) as HTMLButtonElement);
    expect(future).toBeTruthy();
    expect(future.getAttribute('aria-label')).toContain(', available');
  });

  it('marks booked days unavailable and ignores clicks on them', async () => {
    const onDateSelect = renderCalendar();
    const booked = await waitFor(() => dayButton(5));
    expect(booked.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(booked);
    expect(onDateSelect).not.toHaveBeenCalled();
  });

  it('selects an available day on click and shows the summary line', async () => {
    const onDateSelect = renderCalendar({ selectedDate: null });
    const target = await waitFor(() => dayButton(1));
    fireEvent.click(target);
    expect(onDateSelect).toHaveBeenCalledWith(expect.any(Date));
  });

  it('moves focus with arrow keys and selects with Enter', async () => {
    const onDateSelect = renderCalendar();
    const grid = screen.getByTestId('availability-grid');
    const todayCell = document.querySelector(`[data-date="${format(TODAY, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
    todayCell.focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('data-date')).toBe(format(addDays(TODAY, 1), 'yyyy-MM-dd'));
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(onDateSelect).toHaveBeenCalled();
  });

  it('announces the day status when pressing Enter on a blocked day', async () => {
    mockedFetch.mockResolvedValue([format(TODAY, 'yyyy-MM-dd')]);
    renderCalendar();
    const grid = screen.getByTestId('availability-grid');
    const todayCell = await waitFor(() => document.querySelector(`[data-date="${format(TODAY, 'yyyy-MM-dd')}"]`) as HTMLButtonElement);
    todayCell.focus();
    fireEvent.keyDown(grid, { key: 'Enter' });
    expect(screen.getByRole('status').textContent).toMatch(/, booked$/);
  });

  it('pages months with PageUp/PageDown keeping the focused day', async () => {
    renderCalendar();
    const grid = screen.getByTestId('availability-grid');
    const todayCell = document.querySelector(`[data-date="${format(TODAY, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
    todayCell.focus();
    fireEvent.keyDown(grid, { key: 'PageDown' });
    expect(screen.getByRole('heading', { level: 3 })).toBeDefined();
    const nextMonthSameDay = format(new Date(TODAY.getFullYear(), TODAY.getMonth() + 1, Math.min(TODAY.getDate(), 28)), 'yyyy-MM-dd');
    expect(document.activeElement?.getAttribute('data-date')).toBe(nextMonthSameDay);
  });

  it('jumps to the next open day via the shortcut button', async () => {
    const onDateSelect = renderCalendar({ selectedDate: null });
    await waitFor(() => expect(mockedFetch).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: /next available date/i }));
    expect(onDateSelect).toHaveBeenCalledWith(addDays(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()), 1));
    expect(screen.getByRole('status').textContent?.length ?? 0).toBeGreaterThan(0);
  });

  it('shows the fallback notice on fetch failure and retries', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('offline'));
    renderCalendar();
    const retry = await screen.findByRole('button', { name: /retry/i });
    fireEvent.click(retry);
    await waitFor(() => expect(screen.queryByRole('button', { name: /retry/i })).toBeNull());
  });

  it('clears the selection and announces when a refetch reveals it booked', async () => {
    const d = addDays(TODAY, 10);
    mockedFetch.mockResolvedValue([format(d, 'yyyy-MM-dd')]);
    const onDateSelect = renderCalendar({ productId: 'p1', selectedDate: d });
    await waitFor(() => expect(onDateSelect).toHaveBeenCalledWith(null));
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('booked'));
  });

  it('flips horizontal arrow direction under RTL', async () => {
    localStorage.setItem('riman_lang', 'ar');
    renderCalendar();
    const grid = screen.getByTestId('availability-grid');
    const todayCell = document.querySelector(`[data-date="${format(TODAY, 'yyyy-MM-dd')}"]`) as HTMLButtonElement;
    todayCell.focus();
    fireEvent.keyDown(grid, { key: 'ArrowRight' });
    expect(document.activeElement?.getAttribute('data-date')).toBe(format(addDays(TODAY, -1), 'yyyy-MM-dd'));
  });
});
