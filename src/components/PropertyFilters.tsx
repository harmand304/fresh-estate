import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const PropertyFilters = () => {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState<"sale" | "rent">("sale");
  const [location, setLocation] = useState("");

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
    <section id="property-filters" className="py-6 -mt-16 relative z-20">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-2xl shadow-slate-900/10 border border-white/50 overflow-hidden p-6">
          
          {/* Purpose Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setPurpose("sale")}
              className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                purpose === "sale"
                  ? "text-primary border-primary"
                  : "text-slate-500 border-transparent hover:text-slate-700"
              }`}
            >
              Sell
            </button>
            <button
              onClick={() => setPurpose("rent")}
              className={`px-6 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                purpose === "rent"
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
      </div>
    </section>
  );
};

export default PropertyFilters;