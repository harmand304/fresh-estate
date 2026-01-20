import { useState, useEffect } from "react";
import { API_URL } from "@/config";
import { useParams, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import { PropertyCardSkeleton } from "@/components/PropertyCardSkeleton";
import { useProperties } from "@/hooks/useProperties";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Search, ChevronDown, SlidersHorizontal, LayoutGrid, List, Heart, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import OnboardingModal from "@/components/OnboardingModal";

const ITEMS_PER_PAGE = 12;

interface Property {
  id: string;
  title: string;
  price: number;
  purpose: "SALE" | "RENT";
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  area: string;
  type: "Apartment" | "House" | "Villa" | "Office" | "Commercial" | "Land" | "Plot";
  image: string;
  imageKey?: string;
  locationId: number | null;
  agentId: number | null;
  propertyTypeId: number | null;
  description?: string;
  shortDescription?: string;
  images?: string[];
  amenities?: { id: number; name: string }[];
  agent?: {
    id: number;
    name: string;
    image: string;
    phone: string;
  };
}

const Properties = () => {

  const [searchParams] = useSearchParams();
  const { cityName } = useParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [initialLoading, setInitialLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showForYou, setShowForYou] = useState(false);
  const [personalizedProperties, setPersonalizedProperties] = useState<Property[]>([]);
  const [personalizedMessage, setPersonalizedMessage] = useState<string | null>(null);
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    city: "all",
    purpose: "all",
    type: "all",
    bedrooms: "any",
    bathrooms: "any",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    location: "",
  });

  // Initialize filters from URL params
  useEffect(() => {
    const newFilters = { ...filters };
    let hasChanges = false;

    const cityParam = cityName || searchParams.get("city");
    if (cityParam && cityParam !== filters.city) { newFilters.city = cityParam; hasChanges = true; }

    if (searchParams.get("purpose")) { newFilters.purpose = searchParams.get("purpose") || "all"; hasChanges = true; }
    if (searchParams.get("type")) { newFilters.type = searchParams.get("type") || "all"; hasChanges = true; }
    if (searchParams.get("bedrooms")) { newFilters.bedrooms = searchParams.get("bedrooms") || "any"; hasChanges = true; }
    if (searchParams.get("bathrooms")) { newFilters.bathrooms = searchParams.get("bathrooms") || "any"; hasChanges = true; }
    if (searchParams.get("minPrice")) { newFilters.minPrice = searchParams.get("minPrice") || ""; hasChanges = true; }
    if (searchParams.get("maxPrice")) { newFilters.maxPrice = searchParams.get("maxPrice") || ""; hasChanges = true; }
    if (searchParams.get("minArea")) { newFilters.minArea = searchParams.get("minArea") || ""; hasChanges = true; }
    if (searchParams.get("maxArea")) { newFilters.maxArea = searchParams.get("maxArea") || ""; hasChanges = true; }
    if (searchParams.get("location")) { newFilters.location = searchParams.get("location") || ""; hasChanges = true; }

    if (hasChanges) setFilters(newFilters);
  }, [cityName, searchParams, filters]);

  // Use the hook with filters and pagination
  const { properties, loading, pagination } = useProperties({
    ...filters,
    page: currentPage,
    limit: ITEMS_PER_PAGE
  });

  const { isAuthenticated } = useAuth();

  // Initial loading delay to let images load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000); // 2 seconds delay
    return () => clearTimeout(timer);
  }, []);

  // Fetch user favorites
  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${API_URL}/api/favorites`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setFavorites(data);
        })
        .catch(err => console.error('Failed to fetch favorites:', err));
    }
  }, [isAuthenticated]);

  // Check for forYou query param and fetch personalized properties
  useEffect(() => {
    const forYou = searchParams.get('forYou') === 'true';
    if (forYou && isAuthenticated) {
      setShowForYou(true);
      fetchPersonalizedProperties();
    }
  }, [searchParams, isAuthenticated]);

  const fetchPersonalizedProperties = async () => {
    setLoadingPersonalized(true);
    try {
      const res = await fetch(`${API_URL}/api/properties/personalized`, {
        credentials: 'include'
      });
      const data = await res.json();
      setPersonalizedProperties(data.properties || []);
      setPersonalizedMessage(data.message || null);
    } catch (error) {
      console.error('Failed to fetch personalized properties:', error);
      toast.error('Failed to load personalized suggestions');
    } finally {
      setLoadingPersonalized(false);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (propertyId: string) => {
    if (!isAuthenticated) return;

    const isFavorited = favorites.includes(propertyId);
    const method = isFavorited ? 'DELETE' : 'POST';

    try {
      const res = await fetch(`${API_URL}/api/favorites/${propertyId}`, {
        method,
        credentials: 'include'
      });

      if (res.ok) {
        if (isFavorited) {
          setFavorites(prev => prev.filter(id => id !== propertyId));
          toast.success('Removed from favorites');
        } else {
          setFavorites(prev => [...prev, propertyId]);
          toast.success('Added to favorites');
        }
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    scrollToTop();
  };

  // Get display city name
  const displayCity = filters.city !== "all" ? filters.city : "Kurdistan";
  const purposeText = filters.purpose === "SALE" ? "for sale" : filters.purpose === "RENT" ? "for rent" : "for sale";

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const { totalPages } = pagination || { totalPages: 1 };
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8]">
      <Navbar />

      {/* Loading Spinner Overlay */}
      {initialLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white">
          <div className="spinner-container">
            <div className="spinner">
              <div className="spinner">
                <div className="spinner">
                  <div className="spinner">
                    <div className="spinner">
                      <div className="spinner"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style>{`
            .spinner-container {
              width: 150px;
              height: 150px;
              position: relative;
              margin: 30px auto;
              overflow: hidden;
            }
            .spinner {
              position: absolute;
              width: calc(100% - 9.9px);
              height: calc(100% - 9.9px);
              border: 5px solid transparent;
              border-radius: 50%;
              border-top-color: #22c55e;
              animation: spin 5s cubic-bezier(0.17, 0.49, 0.96, 0.79) infinite;
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-8">
          {/* Header Section with Search */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-1">
                Find your dream home in <span className="text-primary">{displayCity}</span>
              </h1>
              <p className="text-muted-foreground text-sm">
                Showing {pagination?.total || 0} homes {purposeText}
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={`${displayCity}, IL`}
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="pl-10 h-11 rounded-lg border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-primary/20 text-sm"
                />
              </div>
              <Button
                className="h-11 w-11 rounded-lg bg-primary hover:bg-primary/90 shadow-md shrink-0"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-2">
              {/* Purpose Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 gap-2">
                    {filters.purpose === "all" ? "Purpose" : filters.purpose === "RENT" ? "For Rent" : "For Sale"}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="space-y-1">
                    {["all", "RENT", "SALE"].map((purpose) => (
                      <button
                        key={purpose}
                        onClick={() => setFilters({ ...filters, purpose })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.purpose === purpose ? "bg-primary text-white" : "hover:bg-gray-100"
                          }`}
                      >
                        {purpose === "all" ? "Any Purpose" : purpose === "RENT" ? "For Rent" : "For Sale"}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* City Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 gap-2">
                    {filters.city === "all" ? "All Cities" : filters.city}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="space-y-1">
                    {["all", "Erbil", "Sulaymaniyah", "Ranya"].map((city) => (
                      <button
                        key={city}
                        onClick={() => setFilters({ ...filters, city })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.city === city ? "bg-primary text-white" : "hover:bg-gray-100"
                          }`}
                      >
                        {city === "all" ? "All Cities" : city}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Price Range Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 gap-2">
                    Price Range
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="start">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Price Range ($)</h4>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice}
                        onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                        className="h-9"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                        className="h-9"
                      />
                    </div>
                    <div className="pt-4">
                      <Slider
                        defaultValue={[0, filters.purpose === "RENT" ? 100000 : 1000000]}
                        min={0}
                        max={filters.purpose === "RENT" ? 100000 : 1000000}
                        step={filters.purpose === "RENT" ? 500 : 1000}
                        value={[
                          filters.minPrice ? parseInt(filters.minPrice) : 0,
                          filters.maxPrice ? parseInt(filters.maxPrice) : (filters.purpose === "RENT" ? 100000 : 1000000)
                        ]}
                        onValueChange={(value) => {
                          setFilters({
                            ...filters,
                            minPrice: value[0].toString(),
                            maxPrice: value[1].toString()
                          });
                        }}
                        className="py-4"
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Property Type Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 gap-2">
                    Property Type
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2" align="start">
                  <div className="space-y-1">
                    {["all", "Apartment", "House", "Villa", "Office", "Commercial", "Land"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFilters({ ...filters, type })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.type === type ? "bg-primary text-white" : "hover:bg-gray-100"
                          }`}
                      >
                        {type === "all" ? "All Types" : type}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Beds & Baths Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 gap-2">
                    Beds & Baths
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4" align="start">
                  <div className="space-y-4">
                    <div>
                      <h2 className="font-medium text-sm mb-2 text-slate-700">Bedrooms</h2>
                      <div className="flex gap-1">
                        {["any", "1", "2", "3", "4", "5+"].map((bed) => (
                          <button
                            key={bed}
                            onClick={() => setFilters({ ...filters, bedrooms: bed })}
                            className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${filters.bedrooms === bed
                              ? "bg-primary text-white border-primary"
                              : "border-gray-200 hover:bg-gray-50 text-slate-600"
                              }`}
                          >
                            {bed === "any" ? "Any" : bed}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h2 className="font-medium text-sm mb-2 text-slate-700">Bathrooms</h2>
                      <div className="flex gap-1">
                        {["any", "1", "2", "3", "4+"].map((bath) => (
                          <button
                            key={bath}
                            onClick={() => setFilters({ ...filters, bathrooms: bath })}
                            className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${filters.bathrooms === bath
                              ? "bg-primary text-white border-primary"
                              : "border-gray-200 hover:bg-gray-50 text-slate-600"
                              }`}
                          >
                            {bath === "any" ? "Any" : bath}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {/* More Filters */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10 rounded-lg border-gray-200 bg-white hover:bg-gray-50 gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    More Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4" align="start">
                  <div className="space-y-4">
                    {/* Area */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Area (m²)</h4>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minArea}
                          onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                          className="h-9"
                        />
                        <span className="text-muted-foreground">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxArea}
                          onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Favorites Filter */}
            {isAuthenticated && (
              <button
                onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowForYou(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${showFavoritesOnly
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:text-red-500'
                  }`}
              >
                <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                Favorites
              </button>
            )}

            {/* For You Button */}
            {isAuthenticated && (
              <button
                onClick={() => {
                  setShowForYou(!showForYou);
                  setShowFavoritesOnly(false);
                  if (!showForYou) {
                    fetchPersonalizedProperties();
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${showForYou
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-emerald-500'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                  }`}
              >
                <Sparkles className={`w-4 h-4 ${showForYou ? 'fill-current' : ''}`} />
                For You
              </button>
            )}

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Property Grid */}
          {loading || loadingPersonalized ? (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {[...Array(8)].map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : showForYou ? (
            <>
              {/* For You Header */}
              <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">Homes picked just for you</h3>
                      <p className="text-sm text-slate-600">Based on your preferences</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowOnboarding(true)}
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Preferences
                  </Button>
                </div>
                {personalizedMessage && (
                  <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{personalizedMessage}</span>
                  </div>
                )}
              </div>

              {personalizedProperties.length > 0 ? (
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                  {personalizedProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      isFavorited={favorites.includes(property.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium text-slate-700">
                    No personalized matches found yet
                  </h3>
                  <p className="text-slate-500 mt-2">Try browsing all properties or update your preferences</p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <Button
                      onClick={() => setShowForYou(false)}
                      variant="outline"
                    >
                      Browse All Properties
                    </Button>
                    <Button
                      onClick={() => setShowOnboarding(true)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Update Preferences
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
                {properties
                  .filter(p => !showFavoritesOnly || favorites.includes(p.id))
                  .map((property) => (
                    <PropertyCard
                      key={property.id}
                      {...property}
                      isFavorited={favorites.includes(property.id)}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))}
              </div>

              {properties.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl">
                  <h3 className="text-xl font-medium text-muted-foreground">
                    No properties found matching your criteria.
                  </h3>
                  <p className="text-muted-foreground mt-2">Try adjusting your filters</p>
                </div>
              )}

              {/* Pagination */}
              {(pagination?.totalPages || 1) > 1 && (
                <div className="mt-12 flex items-center justify-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg w-10 h-10"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  {getPageNumbers().map((page, idx) => (
                    typeof page === "number" ? (
                      <Button
                        key={idx}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-lg transition-all duration-150 ${currentPage === page
                          ? "bg-primary shadow-[0_4px_0_0_#15803d] translate-y-0 hover:shadow-[0_2px_0_0_#15803d] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px]"
                          : "hover:bg-gray-50"
                          }`}
                      >
                        {page}
                      </Button>
                    ) : (
                      <span key={idx} className="px-2 text-muted-foreground">...</span>
                    )
                  ))}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(Math.min(pagination?.totalPages || 1, currentPage + 1))}
                    disabled={currentPage === (pagination?.totalPages || 1)}
                    className="rounded-lg w-10 h-10"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />

      {/* Onboarding Modal for updating preferences */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          setShowOnboarding(false);
          // Refresh personalized properties after updating preferences
          if (showForYou) {
            fetchPersonalizedProperties();
          }
        }}
        skipNavigation={true}
      />
    </div>
  );
};

export default Properties;
