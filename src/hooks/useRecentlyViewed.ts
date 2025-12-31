import { useState, useEffect, useCallback } from 'react';

interface Property {
  id: string;
  title: string;
  price: number;
  image: string;
  city: string;
  type: string;
}

const STORAGE_KEY = 'recentlyViewedProperties';
const MAX_ITEMS = 10;

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([]);

  // Check if cookies are accepted
  const cookiesAccepted = () => {
    return localStorage.getItem('cookieConsent') === 'accepted';
  };

  // Load from localStorage on mount
  useEffect(() => {
    if (cookiesAccepted()) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setRecentlyViewed(JSON.parse(stored));
        }
      } catch (error) {
        console.error('Error loading recently viewed:', error);
      }
    }
  }, []);

  // Add a property to recently viewed
  const addToRecentlyViewed = useCallback((property: Property) => {
    if (!cookiesAccepted()) return;

    setRecentlyViewed((prev) => {
      // Remove if already exists
      const filtered = prev.filter((p) => p.id !== property.id);
      // Add to beginning
      const updated = [property, ...filtered].slice(0, MAX_ITEMS);
      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear all recently viewed
  const clearRecentlyViewed = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setRecentlyViewed([]);
  }, []);

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    cookiesAccepted: cookiesAccepted()
  };
};
