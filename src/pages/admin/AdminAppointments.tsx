import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, Phone, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import { fetchAppointments, updateAppointmentStatus } from '../../services/appointments';
import { isSupabaseConfigured } from '../../services/supabase';
import { Appointment } from '../../types';

const SERVICE_LABELS: Record<string, string> = {
  bridal: 'Bridal Consultation',
  evening: 'Evening Wear Styling',
  rental: 'Rental Fitting',
  alterations: 'Bespoke Alterations',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-stone-50 text-stone-700 border-stone-200',
};

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    if (!isSupabaseConfigured) { setIsLoading(false); return; }
    const timeout = setTimeout(() => setIsLoading(false), 8000);
    try {
      const data = await fetchAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setAppointments([]);
      setError('Unable to connect to the database. Showing offline data.');
    } finally { 
      clearTimeout(timeout);
      setIsLoading(false); 
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;
    const oldStatus = appt.status;
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (selectedAppt?.id === id) setSelectedAppt(prev => prev ? { ...prev, status: newStatus } : null);
    try {
      await updateAppointmentStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update appointment:', err);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: oldStatus } : a));
      if (selectedAppt?.id === id) setSelectedAppt(prev => prev ? { ...prev, status: oldStatus } : null);
      setError('Failed to update status. Changes reverted.');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-gold animate-spin" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl text-stone-800 tracking-wider uppercase">Appointments</h1>
          <p className="text-stone-500 text-sm mt-1">{appointments.length} total bookings</p>
        </div>
      </div>

      {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

      {appointments.length === 0 ? (
        <div className="text-center py-20 bg-ivory border border-stone-100">
          <Calendar className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="font-heading text-stone-400">No appointments yet</p>
          <p className="text-stone-400 text-sm mt-2">Bookings from the appointment page will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(appt => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-ivory border border-stone-100 p-5 hover:border-gold/30 transition-colors cursor-pointer"
              onClick={() => setSelectedAppt(appt)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={cn("text-[10px] tracking-widest uppercase font-bold px-3 py-1 border", STATUS_COLORS[appt.status || 'pending'])}>
                      {appt.status || 'pending'}
                    </span>
                    <span className="text-[10px] tracking-widest uppercase text-gold font-bold">{SERVICE_LABELS[appt.service_type] || appt.service_type}</span>
                  </div>
                  <h3 className="font-heading text-stone-800 text-lg">{appt.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-stone-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {appt.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {appt.time}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {appt.email}</span>
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {appt.phone}</span>
                  </div>
                </div>
                <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleStatusChange(appt.id!, 'confirmed')} className="p-2 text-emerald-500 hover:bg-emerald-50 transition-colors" aria-label="Confirm appointment" title="Confirm">
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleStatusChange(appt.id!, 'cancelled')} className="p-2 text-red-400 hover:bg-red-50 transition-colors" aria-label="Cancel appointment" title="Cancel">
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedAppt && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" onClick={() => setSelectedAppt(null)}>
            <div className="absolute inset-0 bg-onyx/30 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-ivory p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
              <button onClick={() => setSelectedAppt(null)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-800" aria-label="Close"><XCircle className="w-5 h-5" /></button>
              <h2 className="font-heading text-xl text-stone-800 tracking-wider uppercase mb-6">Appointment Details</h2>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Client</span><span className="text-stone-800 font-medium">{selectedAppt.name}</span></div>
                  <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Service</span><span className="text-stone-800 font-medium">{SERVICE_LABELS[selectedAppt.service_type] || selectedAppt.service_type}</span></div>
                  <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Date</span><span className="text-stone-800 font-medium">{selectedAppt.date}</span></div>
                  <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Time</span><span className="text-stone-800 font-medium">{selectedAppt.time}</span></div>
                  <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Email</span><span className="text-stone-800 font-medium">{selectedAppt.email}</span></div>
                  <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Phone</span><span className="text-stone-800 font-medium">{selectedAppt.phone}</span></div>
                </div>
                {selectedAppt.notes && (
                  <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Notes</span><p className="text-stone-600">{selectedAppt.notes}</p></div>
                )}
                <div><span className="text-[10px] tracking-widest uppercase text-stone-400 font-bold block mb-1">Status</span>
                  <span className={cn("text-[10px] tracking-widest uppercase font-bold px-3 py-1 border", STATUS_COLORS[selectedAppt.status || 'pending'])}>
                    {selectedAppt.status || 'pending'}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => { handleStatusChange(selectedAppt.id!, 'confirmed'); setSelectedAppt(null); }} className="btn-luxury text-xs" aria-label="Confirm appointment">Confirm</button>
                <button onClick={() => { handleStatusChange(selectedAppt.id!, 'completed'); setSelectedAppt(null); }} className="btn-luxury-outline text-xs" aria-label="Mark appointment completed">Mark Completed</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

