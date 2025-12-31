import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = `http://${window.location.hostname}:3001`;

const AnalyticsTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const cookiesAccepted = localStorage.getItem('cookieConsent') === 'accepted';
    if (!cookiesAccepted) return;

    // Get or create session ID
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analyticsSessionId', sessionId);
    }

    // Track page view
    fetch(`${API_URL}/api/analytics/pageview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        path: location.pathname,
        sessionId,
        userId: user?.id || null
      })
    }).catch(() => {
      // Silently fail
    });
  }, [location.pathname, user?.id]);

  return null;
};

export default AnalyticsTracker;
