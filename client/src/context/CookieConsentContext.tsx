import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export type ConsentStatus = 'accepted' | 'rejected' | null;

interface CookieConsentContextType {
  consent: ConsentStatus;
  acceptCookies: () => void;
  rejectCookies: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const COOKIE_CONSENT_KEY = 'academora_cookie_consent';

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<ConsentStatus>(null);

  useEffect(() => {
    const storedConsent = Cookies.get(COOKIE_CONSENT_KEY) as ConsentStatus;
    if (storedConsent === 'accepted' || storedConsent === 'rejected') {
      setConsent(storedConsent);
    }
  }, []);

  const acceptCookies = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'accepted', { expires: 365, sameSite: 'Lax' });
    setConsent('accepted');
  };

  const rejectCookies = () => {
    Cookies.set(COOKIE_CONSENT_KEY, 'rejected', { expires: 365, sameSite: 'Lax' });
    setConsent('rejected');
  };

  const resetConsent = () => {
    Cookies.remove(COOKIE_CONSENT_KEY);
    setConsent(null);
  };

  return (
    <CookieConsentContext.Provider value={{ consent, acceptCookies, rejectCookies, resetConsent }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
}
