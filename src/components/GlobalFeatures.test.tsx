import { type ReactElement } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalFeatures from './GlobalFeatures';
import { BrowserRouter } from 'react-router-dom';

const SETTINGS_KEY = 'riman_admin_settings';

function renderWithRouter(ui: ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

beforeEach(() => {
  localStorage.clear();
});

describe('GlobalFeatures', () => {
  it('renders WhatsApp button when enabled', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      features: { whatsappBtn: true },
    }));
    renderWithRouter(<GlobalFeatures />);
    expect(screen.getByLabelText('Contact us on WhatsApp')).toBeDefined();
  });

  it('hides WhatsApp button when disabled', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      features: { whatsappBtn: false },
    }));
    renderWithRouter(<GlobalFeatures />);
    expect(screen.queryByLabelText('Contact us on WhatsApp')).toBeNull();
  });

  it('does not show newsletter popup on initial render', () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({
      features: { newsletter: true },
    }));
    renderWithRouter(<GlobalFeatures />);
    expect(screen.queryByText('The Atelier Circle')).toBeNull();
  });
});
