-- appointments.interested_gowns: gowns the client saved before requesting a viewing
alter table public.appointments
  add column if not exists interested_gowns jsonb;

comment on column public.appointments.interested_gowns is
  'Array of {id,name,size,intent} for gowns saved to the client''s selection';
