import { describe, it, expect } from 'vitest';
import { buildOrderConfirmationEmail, buildAppointmentEmail } from './notifications';

describe('buildOrderConfirmationEmail', () => {
  it('builds payload with order details', () => {
    const result = buildOrderConfirmationEmail({
      id: 'abc-123',
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      subtotal: 45000,
      type: 'sale',
    });

    expect(result.type).toBe('order_confirmed');
    expect(result.to).toBe('jane@example.com');
    expect(result.subject).toContain('abc-123');
    expect(result.data.customer_name).toBe('Jane Doe');
    expect(result.data.total).toBe(45000);
  });

  it('handles missing order id gracefully', () => {
    const result = buildOrderConfirmationEmail({
      customer_email: 'test@example.com',
      subtotal: 0,
      type: 'rental',
    });

    expect(result.subject).toContain('undefined');
  });
});

describe('buildAppointmentEmail', () => {
  it('builds payload with appointment details', () => {
    const result = buildAppointmentEmail({
      name: 'Jane Doe',
      email: 'jane@example.com',
      date: '2025-06-15',
      time: '14:00',
      service_type: 'bridal_consultation',
    });

    expect(result.type).toBe('appointment_booked');
    expect(result.to).toBe('jane@example.com');
    expect(result.subject).toContain('2025-06-15');
    expect(result.data.service).toBe('bridal_consultation');
  });
});
