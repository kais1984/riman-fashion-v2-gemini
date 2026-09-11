import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../../contexts/LanguageContext';
import InvitationRule from './InvitationRule';

describe('InvitationRule', () => {
  beforeEach(() => {
    localStorage.setItem('riman_lang', 'en');
  });

  it('renders invitation line and link to appointments', () => {
    render(
      <MemoryRouter>
        <LanguageProvider>
          <InvitationRule />
        </LanguageProvider>
      </MemoryRouter>
    );
    expect(screen.getByText('Continue the conversation — request a private viewing.')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /request a private viewing/i });
    expect(link).toHaveAttribute('href', '/appointment');
  });
});
