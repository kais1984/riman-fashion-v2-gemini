import { supabase, isSupabaseConfigured } from './supabase';
import { Appointment } from '../types';

const LOCAL_APPOINTMENTS_KEY = 'riman_appointments';

function getLocalAppointments(): Appointment[] {
  try {
    const data = localStorage.getItem(LOCAL_APPOINTMENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalAppointments(appointments: Appointment[]): void {
  localStorage.setItem(LOCAL_APPOINTMENTS_KEY, JSON.stringify(appointments));
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'created_at'>): Promise<Appointment> {
  if (!isSupabaseConfigured) {
    return createLocalAppointment(appointment);
  }

  try {
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        date: appointment.date,
        time: appointment.time,
        service_type: appointment.service_type,
        notes: appointment.notes,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Appointment;
  } catch (err: any) {
    // Fall back to local storage if Supabase is unreachable (e.g. paused project)
    if (err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'))) {
      return createLocalAppointment(appointment);
    }
    throw err;
  }
}

function createLocalAppointment(appointment: Omit<Appointment, 'id' | 'status' | 'created_at'>): Appointment {
  const appointments = getLocalAppointments();
  const newAppointment: Appointment = {
    ...appointment,
    id: `local-${Date.now()}`,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  appointments.push(newAppointment);
  saveLocalAppointments(appointments);
  return newAppointment;
}

export async function fetchAppointments(): Promise<Appointment[]> {
  if (!isSupabaseConfigured) return getLocalAppointments();

  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return (data || []) as Appointment[];
  } catch (err: any) {
    // Fall back to local storage if Supabase is unreachable
    if (err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'))) {
      return getLocalAppointments();
    }
    throw err;
  }
}

export async function updateAppointmentStatus(id: string, status: string): Promise<void> {
  if (!isSupabaseConfigured) {
    updateLocalAppointmentStatus(id, status);
    return;
  }

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id);

    if (error) throw error;
  } catch (err: any) {
    // Fall back to local storage if Supabase is unreachable
    if (err instanceof TypeError || (err.message && err.message.includes('Failed to fetch'))) {
      updateLocalAppointmentStatus(id, status);
      return;
    }
    throw err;
  }
}

function updateLocalAppointmentStatus(id: string, status: string): void {
  const appointments = getLocalAppointments();
  const appt = appointments.find(a => a.id === id);
  if (appt) {
    appt.status = status as any;
    saveLocalAppointments(appointments);
  }
}