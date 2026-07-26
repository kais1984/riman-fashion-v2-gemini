import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { cn } from '../../lib/utils';
import { Calendar as CalendarIcon, Clock, User, Package, ChevronLeft, ChevronRight } from 'lucide-react';

const mockReservations = [
  { id: '1', date: new Date(2026, 3, 14), customer: 'Fatima A.', service: 'Rental', item: 'Arabella Gown' },
  { id: '2', date: new Date(2026, 3, 14), customer: 'Laila K.', service: 'Consultation', item: 'Bridal Selection' },
  { id: '3', date: new Date(2026, 3, 20), customer: 'Sara M.', service: 'Fitting', item: 'Evening Gala' },
];

export default function AdminCalendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const navigateMonth = (delta: number) => {
    setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + delta);
      return d;
    });
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectionsForDay = selectedDate ? mockReservations.filter(res => isSameDay(res.date, selectedDate)) : [];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Calendar View */}
        <div className="lg:col-span-3 bg-ivory border border-stone-200">
          <div className="p-8 border-b border-stone-100 flex justify-between items-center">
            <h3 className="font-heading text-2xl text-stone-800 tracking-wide uppercase">
              {format(currentMonth, 'MMMM yyyy')}
            </h3>
            <div className="flex gap-2">
              <button onClick={() => navigateMonth(-1)} className="px-3 py-2 border border-stone-200 hover:bg-stone-50 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <button onClick={() => navigateMonth(1)} className="px-3 py-2 border border-stone-200 hover:bg-stone-50 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              <button onClick={() => { setCurrentMonth(new Date()); setSelectedDate(new Date()); }} className="px-4 py-2 text-[10px] tracking-widest uppercase border border-stone-200 hover:bg-stone-50 transition-colors">Today</button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-stone-100 bg-stone-50">
            {dayLabels.map(label => (
              <div key={label} className="py-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center border-r border-stone-100 last:border-r-0">
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px bg-stone-100">
            {days.map((day, i) => {
              const reservations = mockReservations.filter(res => isSameDay(res.date, day));
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "min-h-[120px] bg-ivory p-2 transition-all cursor-pointer w-full text-left group",
                    isSelected ? "ring-2 ring-inset ring-gold z-10" : "hover:bg-ivory",
                    !isCurrentMonth && "opacity-30"
                  )}
                >
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1",
                    isSelected ? "bg-gold text-white" : "text-stone-400 group-hover:text-stone-800"
                  )}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-2 space-y-1">
                    {reservations.map(res => (
                      <div key={res.id} className="text-[8px] bg-gold/5 border border-gold/10 px-2 py-1 flex items-center justify-between">
                         <span className="font-bold text-stone-800 truncate">{res.customer}</span>
                         <span className={cn(
                           "px-1",
                           res.service === 'Rental' ? 'text-blue-600' : 'text-gold'
                         )}>●</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Details */}
        <div className="space-y-6">
          <div className="bg-ivory border border-stone-200 p-8">
            <h4 className="font-heading text-lg text-stone-800 uppercase tracking-widest mb-6">Day Agenda</h4>
            <p className="text-[10px] tracking-widest text-stone-400 uppercase mb-8">{selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'No date selected'}</p>
            
            <div className="space-y-6">
              {selectionsForDay.length > 0 ? selectionsForDay.map(res => (
                <div key={res.id} className="p-4 bg-ivory border-l-2 border-gold space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-stone-800 uppercase tracking-widest">
                    <User className="w-3 h-3 text-gold" /> {res.customer}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-stone-500 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> 10:30 AM - {res.service}
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-stone-500 uppercase tracking-widest">
                    <Package className="w-3 h-3" /> {res.item}
                  </div>
                  <button onClick={() => setSelectedDate(null)} className="w-full mt-2 py-2 text-[8px] tracking-[0.2em] font-bold uppercase border border-gold/20 text-gold hover:bg-gold hover:text-white transition-all">
                    View Dossier
                  </button>
                </div>
              )) : (
                <div className="py-20 text-center">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest italic">No bookings on this date</p>
                </div>
              )}
            </div>
            
            <button onClick={() => navigate('/appointment')} className="w-full mt-8 btn-luxury flex items-center justify-center gap-2">
               <CalendarIcon className="w-4 h-4" /> New Booking
            </button>
          </div>

          <div className="bg-stone-900 p-8 text-white">
            <h4 className="text-[10px] tracking-widest uppercase text-gold mb-4">Capacity Insight</h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-[8px] uppercase tracking-widest mb-2 font-bold">
                  <span>Atelier Slots</span>
                  <span>80%</span>
                </div>
                <div className="h-1 bg-stone-800 overflow-hidden">
                  <div className="h-full bg-gold w-4/5" />
                </div>
              </div>
              <p className="text-[9px] text-stone-400 leading-relaxed italic">The Sharjah boutique is nearing capacity for bridal consultations in April.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
