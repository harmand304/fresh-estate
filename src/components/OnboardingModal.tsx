import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { X, Home, Building2, MapPin, Sparkles, DollarSign, Heart, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  skipNavigation?: boolean; // When true, don't navigate after submission
}

interface City {
  id: number;
  name: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const OnboardingModal = ({ isOpen, onClose, skipNavigation = false }: OnboardingModalProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [cities, setCities] = useState<City[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [preferences, setPreferences] = useState({
    purpose: '',
    cityId: null as number | null,
    propertyType: '',
    propertyStyle: 'BOTH', // Default to both
    minPrice: 0,
    maxPrice: 500000
  });

  useEffect(() => {
    if (isOpen) {
      fetchCities();
    }
  }, [isOpen]);

  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cities`);
      if (res.ok) {
        const data = await res.json();
        setCities(data);
      }
    } catch (error) {
      console.error('Failed to fetch cities:', error);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/user/preferences`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(preferences)
      });

      if (res.ok) {
        toast.success('Preferences saved!');
        onClose();
        if (!skipNavigation) {
          navigate('/properties?forYou=true');
        }
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const canProceed = () => {
    switch (step) {
      case 1: return !!preferences.purpose;
      case 2: return true; // City is optional
      case 3: return !!preferences.propertyType;
      case 4: return true;
      default: return false;
    }
  };

  if (!isOpen) return null;

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🌸</div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome!</h2>
            <p className="text-slate-600 text-lg">Let's find a place that feels right for you.</p>
            <p className="text-emerald-600 font-medium">👉 What are you here for today?</p>
            <div className="grid gap-3 mt-6">
              {[
                { value: 'BUY', label: 'Buy', icon: '🏠' },
                { value: 'RENT', label: 'Rent', icon: '🔑' },
                { value: 'BOTH', label: 'Show me both', icon: '✨' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPreferences({ ...preferences, purpose: opt.value })}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 text-lg font-medium ${
                    preferences.purpose === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.icon}</span> {opt.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-2xl font-bold text-slate-900">Choose your city</h2>
            <p className="text-slate-600 text-lg">Where would you like to look?</p>
            <div className="grid gap-3 mt-6">
              <button
                onClick={() => setPreferences({ ...preferences, cityId: null })}
                className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 text-lg font-medium ${
                  preferences.cityId === null
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <MapPin className="w-5 h-5" /> All Cities
              </button>
              {cities.map(city => (
                <button
                  key={city.id}
                  onClick={() => setPreferences({ ...preferences, cityId: city.id })}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 text-lg font-medium ${
                    preferences.cityId === city.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-5 h-5" /> {city.name}
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🏡</div>
            <h2 className="text-2xl font-bold text-slate-900">Your kind of home</h2>
            <p className="text-slate-600 text-lg">What type of place do you prefer?</p>
            <div className="grid gap-3 mt-6">
              {[
                { value: 'HOUSE', label: 'House', icon: <Home className="w-5 h-5" /> },
                { value: 'APARTMENT', label: 'Apartment', icon: <Building2 className="w-5 h-5" /> },
                { value: 'BOTH', label: 'Show me both', icon: <Sparkles className="w-5 h-5" /> }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPreferences({ ...preferences, propertyType: opt.value })}
                  className={`p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-3 text-lg font-medium ${
                    preferences.propertyType === opt.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                  }`}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">💰</div>
            <h2 className="text-2xl font-bold text-slate-900">Budget, your comfort zone</h2>
            <p className="text-slate-600 text-lg">Let's stay within what feels comfortable for you.</p>
            
            <div className="mt-8 px-4">
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>${preferences.minPrice.toLocaleString()}</span>
                <span>${preferences.maxPrice.toLocaleString()}</span>
              </div>
              <Slider
                value={[preferences.minPrice, preferences.maxPrice]}
                onValueChange={([min, max]) => setPreferences({ ...preferences, minPrice: min, maxPrice: max })}
                min={0}
                max={2000000}
                step={10000}
                className="w-full"
              />
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl">
                <p className="text-emerald-700 font-medium">
                  ${preferences.minPrice.toLocaleString()} - ${preferences.maxPrice.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xl font-bold text-slate-900 mb-4">Are you ready for your dream home? 🏠</p>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg py-6 rounded-xl shadow-lg shadow-emerald-200"
                size="lg"
              >
                {submitting ? (
                  <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <>Show me homes made for me <Heart className="w-5 h-5 ml-2 fill-white" /></>
                )}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-300">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>

        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 rounded-t-3xl overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12">
          {stepContent()}
        </div>

        {/* Navigation */}
        {step > 1 && step < 4 && (
          <div className="px-8 pb-8 flex justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              className="text-slate-600"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
        
        {/* Step 1 Navigation - No Back button */}
        {step === 1 && (
          <div className="px-8 pb-8 flex justify-end">
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
        
        {/* Step 4 Navigation - Back button only, Submit is in content */}
        {step === 4 && (
          <div className="px-8 pb-8 flex justify-start">
            <Button
              variant="ghost"
              onClick={prevStep}
              className="text-slate-600"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;
