import { type ReactElement, useEffect } from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GlobalFeatures from './GlobalFeatures';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import { ToastProvider } from '../contexts/ToastContext';

function FeatureController({ feature, value }: { feature: string; value: boolean }) {
  const { updateSetting } = useSettings();
  useEffect(() => {
    updateSetting('features', feature, value);
  }, [feature, value]);
  return null;
}

function renderWithProviders(ui: ReactElement, feature: string, value: boolean) {
  return render(
    <BrowserRouter>
      <ToastProvider>
        <SettingsProvider>
          <FeatureController feature={feature} value={value} />
          {ui}
        </SettingsProvider>
      </ToastProvider>
    </BrowserRouter>,
  );
}

describe('GlobalFeatures', () => {
  it('renders WhatsApp button when enabled', () => {
    renderWithProviders(<GlobalFeatures />, 'whatsappBtn', true);
    expect(screen.getByLabelText('Contact us on WhatsApp')).toBeDefined();
  });

  it('hides WhatsApp button when disabled', async () => {
    renderWithProviders(<GlobalFeatures />, 'whatsappBtn', false);
    await waitFor(() => expect(screen.queryByLabelText('Contact us on WhatsApp')).toBeNull());
  });

  it('does not show newsletter popup on initial render', () => {
    renderWithProviders(<GlobalFeatures />, 'newsletter', true);
    expect(screen.queryByText('The Atelier Circle')).toBeNull();
  });
});
