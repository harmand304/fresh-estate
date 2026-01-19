import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

import { API_URL } from "@/config";

// Custom hook for counting animation
const useCountUp = (end: number, duration: number = 2000, delay: number = 0) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (end === 0) return;

    const timeout = setTimeout(() => {
      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation (ease-out-cubic)
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentCount = Math.floor(easeOutCubic * end);

        if (currentCount !== countRef.current) {
          countRef.current = currentCount;
          setCount(currentCount);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setCount(end);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [end, duration, delay]);

  return count;
};

const Hero = () => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<"sale" | "rent">("sale");
  const [location, setLocation] = useState("");
  const [stats, setStats] = useState({ propertyCount: 0, cityCount: 0 });

  // Animated counts
  const animatedPropertyCount = useCountUp(stats.propertyCount, 2000, 500);
  const animatedCityCount = useCountUp(stats.cityCount, 1500, 700);
  const animatedHappyClients = useCountUp(98, 2000, 900);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/properties`);
        if (response.ok) {
          const properties = await response.json();
          const propertyCount = properties.length;
          const uniqueCities = new Set(properties.map((p: { city: string }) => p.city));
          setStats({ propertyCount, cityCount: uniqueCities.size });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("purpose", purpose.toUpperCase());
    if (location.trim()) {
      params.set("location", location.trim());
    }
    navigate(`/properties?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/70" />
      </div>

      {/* Text Content - Top Area */}
      <div className="relative z-10 container mx-auto px-4 text-center pt-36">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-primary-foreground/90 font-medium">
              Kurdistan Region, Iraq
            </span>
          </div>

          <h1
            className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-primary-foreground leading-tight mb-8 animate-fade-up"
            style={{ animationDelay: "0.2s" }}
          >
            Find Your Perfect Home in Kurdistan
          </h1>
        </div>
      </div>

      {/* Search Box - Absolutely Positioned */}
      <div
        className="absolute inset-x-0 mx-auto top-1/2 -translate-y-1/2 z-20 w-full max-w-xl bg-white rounded-2xl shadow-2xl p-6 animate-fade-up"
        style={{ animationDelay: "0.4s" }}
      >
        {/* Purpose Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setPurpose("sale")}
            className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${purpose === "sale"
              ? "text-primary border-primary"
              : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
          >
            Sell
          </button>
          <button
            onClick={() => setPurpose("rent")}
            className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${purpose === "rent"
              ? "text-primary border-primary"
              : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
          >
            Rent
          </button>
        </div>

        {/* Location Search */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="City, Neighborhood, Area..."
              className="w-full h-12 pl-12 pr-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 focus:bg-white transition-all"
            />
          </div>
          <Button
            onClick={handleSearch}
            className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:shadow-primary/40"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Stats - Bottom Area */}
      <div className="relative z-10 container mx-auto px-4 text-center mt-auto pb-8">
        <div className="max-w-3xl mx-auto">
          <div
            className="grid grid-cols-3 gap-8 pt-8 border-t border-primary-foreground/20 animate-fade-up max-w-2xl mx-auto"
            style={{ animationDelay: "0.5s" }}
          >
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
                {animatedPropertyCount > 0 ? `${animatedPropertyCount}+` : "0"}
              </div>
              <div className="text-primary-foreground/70 text-sm mt-1">
                Properties Listed
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
                {animatedCityCount > 0 ? animatedCityCount : "0"}
              </div>
              <div className="text-primary-foreground/70 text-sm mt-1">
                Major Cities
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-display font-bold text-primary-foreground">
                {animatedHappyClients}%
              </div>
              <div className="text-primary-foreground/70 text-sm mt-1">
                Happy Clients
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;