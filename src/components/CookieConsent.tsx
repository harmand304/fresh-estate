import { useState, useEffect } from 'react';
import { Cookie, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieChoice = localStorage.getItem('cookieConsent');
    if (!cookieChoice) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
    // Trigger analytics initialization
    window.dispatchEvent(new CustomEvent('cookiesAccepted'));
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Cookie className="w-6 h-6 text-primary" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">🍪 We use cookies</h3>
            <p className="text-slate-300 text-sm">
              We use cookies to improve your experience, remember your preferences, 
              and track analytics. By accepting, you help us provide better service 
              and remember properties you've viewed.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 flex-shrink-0 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={handleDecline}
              className="flex-1 md:flex-none bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <X className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 md:flex-none"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
