import { useState } from "react";
import { Link } from "react-router-dom";
import PropertyCard from "./PropertyCard";
import { Property } from "@/hooks/useProperties";
import { PropertyCardSkeleton } from "./PropertyCardSkeleton";
import { Home } from "lucide-react";

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
}

const PropertyGrid = ({ properties, loading }: PropertyGridProps) => {
  const [activeFilter, setActiveFilter] = useState<"all" | "new" | "sale">("all");

  const filteredProperties = (properties || []).filter((property) => {
    if (!property) return false;
    if (activeFilter === "all") return true;
    if (activeFilter === "new") return true; // Show all as "new" for now
    if (activeFilter === "sale") return property.purpose === "SALE";
    return true;
  });

  return (
    <section className="py-12 md:py-16 bg-emerald-50/50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Trending Homes in Your Area
            </h2>
            <p className="text-muted-foreground mt-1">
              The most viewed eco-friendly properties this week.
            </p>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white rounded-full p-1 shadow-sm border border-border">
            <button
              onClick={() => setActiveFilter("all")}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === "all"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Home className="w-4 h-4" />
              All
            </button>
            <button
              onClick={() => setActiveFilter("new")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === "new"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              New
            </button>
            <button
              onClick={() => setActiveFilter("sale")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeFilter === "sale"
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              For Sale
            </button>
          </div>
        </div>

        {/* Property Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProperties.slice(0, 4).map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="flex justify-center mt-10">
          <Link
            to="/properties"
            className="px-8 py-3 bg-white border-2 border-foreground text-foreground font-semibold rounded-full hover:bg-foreground hover:text-white transition-all duration-300"
          >
            View All Listings
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;