import { useState, useEffect } from "react";
import { API_URL } from "@/config";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PropertyCarousel from "@/components/PropertyCarousel";
import PropertyGrid from "@/components/PropertyGrid";
import Services from "@/components/Services";
import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/TestimonialsSection";
import OnboardingModal from "@/components/OnboardingModal";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/contexts/AuthContext";


const Index = () => {
  const { properties, loading } = useProperties();
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user just registered (via query param)
    const justRegistered = searchParams.get('registered') === 'true';

    if (justRegistered && isAuthenticated) {
      // Check if user already has preferences
      const checkPreferences = async () => {
        try {
          const res = await fetch(`${API_URL}/api/user/preferences`, {
            credentials: 'include'
          });
          const data = await res.json();

          // If no preferences, show onboarding after 5 seconds
          if (!data || !data.id) {
            setTimeout(() => {
              setShowOnboarding(true);
            }, 5000);
          }

          // Clear the query param
          searchParams.delete('registered');
          setSearchParams(searchParams);
        } catch (error) {
          console.error('Error checking preferences:', error);
        }
      };

      checkPreferences();
    }
  }, [isAuthenticated, searchParams, setSearchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <PropertyCarousel properties={properties} loading={loading} />
        <PropertyGrid properties={(properties || []).slice(0, 6)} loading={loading} />
        <Services />
        <TestimonialsSection />
      </main>
      <Footer />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  );
};

export default Index;