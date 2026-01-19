import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = `http://${window.location.hostname}:3001`;

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Check if cookies are accepted
  const cookiesAccepted = () => {
    return localStorage.getItem('cookieConsent') === 'accepted';
  };

  // Get or create session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analyticsSessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('analyticsSessionId', sessionId);
    }
    return sessionId;
  };

  // Track page view
  const trackPageView = useCallback(async (path: string) => {
    if (!cookiesAccepted()) return;

    try {
      await fetch(`${API_URL}/api/analytics/pageview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          path,
          sessionId: getSessionId(),
          userId: user?.id || null
        })
      });
    } catch (error) {
      // Silently fail for analytics
      console.debug('Analytics error:', error);
    }
  }, [user]);

  // Track page views on route change
  useEffect(() => {
    if (cookiesAccepted()) {
      trackPageView(location.pathname);
    }
  }, [location.pathname, trackPageView]);

  // Track custom events
  const trackEvent = useCallback(async (event: string, data?: Record<string, unknown>) => {
    if (!cookiesAccepted()) return;

    try {
      await fetch(`${API_URL}/api/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          event,
          data,
          sessionId: getSessionId(),
          userId: user?.id || null
        })
      });
    } catch (error) {
      console.debug('Analytics error:', error);
    }
  }, [user]);

  return {
    trackPageView,
    trackEvent,
    cookiesAccepted: cookiesAccepted()
  };
};
