import React from 'react';
import { useCookieConsent } from '@/context/CookieConsentContext';
import { Link } from 'react-router-dom';

export function CookieConsentBanner() {
  const { consent, acceptCookies, rejectCookies } = useCookieConsent();

  // Don't show if consent is already given or rejected
  if (consent !== null) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full duration-300">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm text-gray-600 dark:text-gray-300">
          <p>
            We use cookies to enhance your experience, analyze site traffic, and personalize content. 
            By clicking "Accept", you agree to our use of cookies. 
            Read our <Link to="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Privacy Policy</Link> and <Link to="/cookies" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Cookie Policy</Link>.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={rejectCookies}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Decline
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm"
          >
            Accept Cookies
          </button>
        </div>
      </div>
    </div>
  );
}
