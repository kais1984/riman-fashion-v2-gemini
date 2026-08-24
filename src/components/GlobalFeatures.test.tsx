import { type ReactElement, useEffect } from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import GlobalFeatures from './GlobalFeatures';
import { BrowserRouter } from 'react-router-dom';
import { SettingsProvider, useSettings } from '../contexts/SettingsContext';
import { ToastProvider } from '../contexts/ToastContext';
import { LanguageProvider } from '../contexts/LanguageContext';

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
          <LanguageProvider>
            <FeatureController feature={feature} value={value} />
            {ui}
          </LanguageProvider>
        </SettingsProvider>
      </ToastProvider>
    </BrowserRouter>,
  );
}

describe('GlobalFeatures', () => {
  beforeEach(() => {
    localStorage.setItem('riman_lang', 'en');
    localStorage.removeItem('riman_cookie_consent');
  });

  it('renders WhatsApp button when enabled', () => {
    renderWithProviders(<GlobalFeatures />, 'whatsappBtn', true);
    expect(screen.getByLabelText('Chat with us on WhatsApp')).toBeDefined();
  });

  it('hides WhatsApp button when disabled', async () => {
    renderWithProviders(<GlobalFeatures />, 'whatsappBtn', false);
    await waitFor(() => expect(screen.queryByLabelText('Chat with us on WhatsApp')).toBeNull());
  });

  it('does not show newsletter popup on initial render', () => {
    renderWithProviders(<GlobalFeatures />, 'newsletter', true);
    expect(screen.queryByText(/Atelier Circle|دائرة الأتيليه/)).toBeNull();
  });

  it('renders Arabic cookie banner copy under ar locale when consent not yet given', () => {
    localStorage.setItem('riman_lang', 'ar');
    localStorage.removeItem('riman_cookie_consent');
    renderWithProviders(<GlobalFeatures />, 'cookieBanner', true);
    expect(screen.getByText('الخصوصية والأناقة')).toBeInTheDocument();
  });

  it('hides cookie banner once consent is stored', () => {
    localStorage.setItem('riman_cookie_consent', 'true');
    renderWithProviders(<GlobalFeatures />, 'cookieBanner', true);
    expect(screen.queryByText(/Privacy|خصوصية/)).toBeNull();
  });
});
