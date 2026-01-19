import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { API_URL } from "@/config";
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Search,
  Star,
  Building2,
  Calendar,
  User,
  ChevronDown,
  X,
  Phone,
  Mail,
  Copy
} from 'lucide-react';
import { toast } from "sonner";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Agent {
  id: number;
  name: string;
  phone: string;
  email: string;
  image: string;
  bio: string;
  experience: number;
  rating: number;
  reviewCount: number;
  isTopAgent: boolean;
  cityName: string;
  propertyCount: number;
  specialties: string[];
  languages: string[];
}


// Static data for filters (will be dynamic later)
const SPECIALIZATIONS = [
  "Luxury Homes",
  "Commercial",
  "Residential",
  "Land",
  "Investment",
  "First-Time Buyers",
  "Downtown",
  "Suburban",
  "Eco-Friendly",
  "Vacation Homes"
];



const EXPERIENCE_OPTIONS = [
  { label: "Any Experience", value: "any" },
  { label: "1-3 Years", value: "1-3" },
  { label: "4-7 Years", value: "4-7" },
  { label: "8-15 Years", value: "8-15" },
  { label: "15+ Years", value: "15+" }
];

const Agents = () => {
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);

  // Filter states
  const [filters, setFilters] = useState({
    specialization: 'all',
    language: 'all',
    experience: 'any',
    minRating: 0,
    topRated: false
  });

  // Fetch agents with React Query
  const { data: agents = [], isLoading: loadingAgents } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/agents`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      return response.json();
    },
    retry: 2,
  });

  // Fetch languages with React Query
  const { data: languages = [] } = useQuery({
    queryKey: ['languages'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/languages`);
      if (!response.ok) throw new Error('Failed to fetch languages');
      const data = await response.json();
      return Array.isArray(data) ? data.map((l: any) => l.name) : [];
    },
    retry: 2,
  });

  const loading = loadingAgents;

  // Filter agents when search or filters change
  useEffect(() => {
    let result = [...agents];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(agent =>
        agent.name?.toLowerCase().includes(query) ||
        agent.cityName?.toLowerCase().includes(query) ||
        agent.specialties?.some(s => s.toLowerCase().includes(query))
      );
    }

    // Specialization filter
    if (filters.specialization !== 'all') {
      result = result.filter(agent =>
        agent.specialties?.some(s => s.toLowerCase() === filters.specialization.toLowerCase())
      );
    }

    // Languages filter
    if (filters.language !== 'all') {
      result = result.filter(agent =>
        agent.languages?.some(lang => lang.toLowerCase() === filters.language.toLowerCase())
      );
    }

    // Experience filter
    if (filters.experience !== 'any') {
      result = result.filter(agent => {
        const exp = agent.experience || 0;
        switch (filters.experience) {
          case '1-3': return exp >= 1 && exp <= 3;
          case '4-7': return exp >= 4 && exp <= 7;
          case '8-15': return exp >= 8 && exp <= 15;
          case '15+': return exp > 15;
          default: return true;
        }
      });
    }

    // Rating filter
    if (filters.minRating > 0) {
      result = result.filter(agent => (agent.rating || 0) >= filters.minRating);
    }

    // Top Rated filter
    if (filters.topRated) {
      result = result.filter(agent => agent.isTopAgent);
    }

    setFilteredAgents(result);
  }, [agents, searchQuery, filters]);

  const resetFilters = () => {
    setFilters({
      specialization: 'all',
      language: 'all',
      experience: 'any',
      minRating: 0,
      topRated: false
    });
    setSearchQuery('');
  };

  const hasActiveFilters = filters.specialization !== 'all' ||
    filters.language !== 'all' ||
    filters.experience !== 'any' ||
    filters.minRating > 0 ||
    filters.topRated ||
    searchQuery.trim() !== '';

  // Handle star click with half-star support
  const handleStarClick = (starIndex: number, e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;
    const newRating = isLeftHalf ? starIndex - 0.5 : starIndex;
    // Toggle off if clicking same rating
    setFilters({ ...filters, minRating: filters.minRating === newRating ? 0 : newRating });
  };

  const loadMore = () => {
    setVisibleCount(prev => prev + 6);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f8faf8]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-lg h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8]">
      <Navbar />

      <main className="flex-1 pt-32 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Find Your Perfect Agent</h1>
            <p className="text-slate-600 max-w-2xl">
              Browse our directory of top-rated real estate professionals ready to help you buy or sell your dream property.
            </p>
          </div>

          {/* Search & Filter Container */}
          <div className="bg-white rounded-2xl p-6 mb-10 shadow-sm">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by agent name, city, or zip code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-0 bg-[#e8f5e9]/50 text-base w-full"
                />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-600 font-medium">Filter by:</span>

                {/* Specialization Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 rounded-lg border-0 bg-[#e8f5e9]/70 hover:bg-[#e8f5e9] gap-1 text-sm">
                      {filters.specialization === 'all' ? 'Specialization' : filters.specialization}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="start">
                    <div className="space-y-1">
                      <button
                        onClick={() => setFilters({ ...filters, specialization: 'all' })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.specialization === 'all' ? 'bg-primary text-white' : 'hover:bg-slate-100'
                          }`}
                      >
                        All Specializations
                      </button>
                      {SPECIALIZATIONS.map((spec) => (
                        <button
                          key={spec}
                          onClick={() => setFilters({ ...filters, specialization: spec })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.specialization === spec ? 'bg-primary text-white' : 'hover:bg-slate-100'
                            }`}
                        >
                          {spec}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Languages Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 rounded-lg border-0 bg-[#e8f5e9]/70 hover:bg-[#e8f5e9] gap-1 text-sm">
                      {filters.language === 'all' ? 'Languages' : filters.language}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="start">
                    <div className="space-y-1">
                      <button
                        onClick={() => setFilters({ ...filters, language: 'all' })}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.language === 'all' ? 'bg-primary text-white' : 'hover:bg-slate-100'
                          }`}
                      >
                        All Languages
                      </button>
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setFilters({ ...filters, language: lang })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.language === lang ? 'bg-primary text-white' : 'hover:bg-slate-100'
                            }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Experience Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 rounded-lg border-0 bg-[#e8f5e9]/70 hover:bg-[#e8f5e9] gap-1 text-sm">
                      {filters.experience === 'any' ? 'Experience' : EXPERIENCE_OPTIONS.find(o => o.value === filters.experience)?.label}
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align="start">
                    <div className="space-y-1">
                      {EXPERIENCE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setFilters({ ...filters, experience: opt.value })}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.experience === opt.value ? 'bg-primary text-white' : 'hover:bg-slate-100'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Top Rated Filter */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="h-9 rounded-lg border-0 bg-[#e8f5e9]/70 hover:bg-[#e8f5e9] gap-1 text-sm">
                      Top Rated
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-3" align="start">
                    <div className="space-y-3">
                      <p className="text-sm text-slate-500">Minimum rating</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((starNum) => {
                          const filled = filters.minRating >= starNum;
                          const halfFilled = filters.minRating === starNum - 0.5;
                          return (
                            <button
                              key={starNum}
                              onClick={(e) => handleStarClick(starNum, e)}
                              className="relative w-6 h-6 hover:scale-110 transition-transform"
                              title={`${starNum} stars`}
                            >
                              <Star className="w-6 h-6 text-slate-300 absolute inset-0" />
                              {filled && (
                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 absolute inset-0" />
                              )}
                              {halfFilled && (
                                <div className="absolute inset-0 overflow-hidden w-[50%]">
                                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.topRated}
                          onChange={(e) => setFilters({ ...filters, topRated: e.target.checked })}
                          className="w-4 h-4 accent-primary"
                        />
                        <span className="text-sm">Top Rated Only</span>
                      </label>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Reset Filters */}
              <button
                onClick={resetFilters}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Agents Grid */}
          {filteredAgents.length === 0 ? (
            <div className="text-center py-16">
              <User className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 text-lg">No agents found matching your criteria</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={resetFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAgents.slice(0, visibleCount).map((agent) => (
                  <div
                    key={agent.id}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all border border-slate-100 flex flex-col h-full"
                  >
                    {/* Agent Image */}
                    <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl bg-slate-100">
                      <Link to={`/agents/${agent.id}`} className="block w-full h-full">
                        {agent.image ? (
                          <img
                            src={agent.image}
                            alt={agent.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <User className="w-20 h-20 text-primary/40" />
                          </div>
                        )}
                      </Link>

                      {/* Rating Badge */}
                      {agent.rating > 0 && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-slate-900">{agent.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Agent Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-slate-900">{agent.name}</h3>
                      <p className="text-primary text-sm font-medium mt-0.5">
                        {Array.isArray(agent.specialties) ? (agent.specialties[0] || 'Real Estate Agent') : (agent.specialties || 'Real Estate Agent')}
                      </p>

                      {/* Bio */}
                      <p className="text-slate-600 text-sm mt-3 line-clamp-2">
                        {agent.bio || `Helping clients find their perfect home in ${agent.cityName || 'Kurdistan'}.`}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-primary" />
                          <span className="font-medium">{agent.propertyCount || 0}</span>
                          <span>Sold</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">{agent.experience || 0}</span>
                          <span>Yrs</span>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3 mt-auto pt-5">
                        <Button
                          variant="outline"
                          className="flex-1 rounded-lg border-primary text-primary hover:bg-primary/5"
                          asChild
                        >
                          <Link to={`/agents/${agent.id}`}>View Profile</Link>
                        </Button>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              className="flex-1 rounded-lg"
                            >
                              CONTACT
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0 rounded-xl overflow-hidden shadow-xl border-slate-100" align="end" sideOffset={8}>
                            <div className="flex flex-col animate-in fade-in zoom-in-95 duration-200">
                              {/* Phone Section */}
                              <div className="p-4 hover:bg-emerald-50/50 transition-colors border-b border-slate-100 group">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Phone className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Call Agent</p>
                                    <p className="text-slate-900 font-medium truncate text-sm" title={agent.phone}>{agent.phone}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100"
                                    onClick={() => {
                                      navigator.clipboard.writeText(agent.phone);
                                      toast.success("Phone number copied!");
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                                <Button className="w-full h-9 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm" variant="outline" asChild>
                                  <a href={`tel:${agent.phone}`}>Call Now</a>
                                </Button>
                              </div>

                              {/* Email Section */}
                              <div className="p-4 hover:bg-blue-50/50 transition-colors group">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                                    <Mail className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Email Agent</p>
                                    <p className="text-slate-900 font-medium truncate text-sm" title={agent.email}>{agent.email}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-100"
                                    onClick={() => {
                                      navigator.clipboard.writeText(agent.email);
                                      toast.success("Email copied!");
                                    }}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                </div>
                                <Button className="w-full h-9 bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm" variant="outline" asChild>
                                  <a href={`mailto:${agent.email}`}>Send Email</a>
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {visibleCount < filteredAgents.length && (
                <div className="text-center mt-10">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    className="rounded-lg px-8 gap-2"
                  >
                    Load More Agents
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Agents;
