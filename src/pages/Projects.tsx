import { useState, useEffect } from "react";
import { API_URL } from "@/config";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  ChevronDown
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


interface Project {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  status: string;
  location: string | null;
  priceRange: string | null;
  bedRange: string | null;
  bathRange: string | null;
  sqftRange: string | null;
  propertyCount: number;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PRE_SELLING: { bg: 'bg-blue-500', text: 'Pre-Selling' },
  COMPLETED: { bg: 'bg-green-500', text: 'Completed' },
  HOT_DEAL: { bg: 'bg-red-500', text: 'Hot Deal' },
  COMMERCIAL: { bg: 'bg-orange-500', text: 'Commercial' },
  RESALE: { bg: 'bg-purple-500', text: 'Resale' },
  COMING_SOON: { bg: 'bg-gray-500', text: 'Coming Soon' },
};

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");

  // Initial loading delay to let images load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_URL}/api/projects`);
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Get unique locations for filter
  const locations = [...new Set(projects.map(p => p.location).filter(Boolean))];

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      project.name.toLowerCase().includes(searchLower) ||
      project.location?.toLowerCase().includes(searchLower);
    const matchesLocation = locationFilter === "all" || project.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const handleViewProperties = (projectId: number) => {
    navigate(`/properties?projectId=${projectId}`);
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
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Our Latest Projects
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover exclusive developments and future landmarks curated just for you.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-full shadow-lg p-2 mb-10 flex items-center gap-2 max-w-3xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects by location or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-0 focus-visible:ring-0 text-base"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button className="rounded-full bg-primary hover:bg-primary/90 text-white gap-2 px-5">
                  {locationFilter === "all" ? "All Locations" : locationFilter}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="end">
                <div className="space-y-1">
                  <button
                    onClick={() => setLocationFilter("all")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${locationFilter === "all" ? "bg-primary text-white" : "hover:bg-gray-100"
                      }`}
                  >
                    All Locations
                  </button>
                  {locations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setLocationFilter(loc!)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${locationFilter === loc ? "bg-primary text-white" : "hover:bg-gray-100"
                        }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
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
                  width: 100px;
                  height: 100px;
                  position: relative;
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

          {/* Empty State */}
          {!loading && filteredProjects.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Square className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Projects Found</h3>
              <p className="text-gray-500">
                {searchQuery || locationFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Check back soon for new developments"}
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {!loading && filteredProjects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const statusInfo = statusColors[project.status] || statusColors.PRE_SELLING;

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group"
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Square className="w-16 h-16 text-gray-400" />
                        </div>
                      )}

                      {/* Status Badge */}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-lg text-white text-xs font-semibold ${statusInfo.bg}`}>
                        {statusInfo.text}
                      </div>

                      {/* Heart Icon */}
                      <button className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      {/* Title and Price */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-foreground">{project.name}</h3>
                        {project.priceRange && (
                          <span className="text-primary font-bold">{project.priceRange}</span>
                        )}
                      </div>

                      {/* Location */}
                      {project.location && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          {project.location}
                        </div>
                      )}

                      {/* Description */}
                      {project.description && (
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 border-t pt-4">
                        {project.bedRange && (
                          <div className="flex items-center gap-1.5">
                            <Bed className="w-4 h-4" />
                            <span>{project.bedRange}</span>
                          </div>
                        )}
                        {project.bathRange && (
                          <div className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4" />
                            <span>{project.bathRange}</span>
                          </div>
                        )}
                        {project.sqftRange && (
                          <div className="flex items-center gap-1.5">
                            <Square className="w-4 h-4" />
                            <span>{project.sqftRange}</span>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <Button
                        onClick={() => handleViewProperties(project.id)}
                        className="w-full bg-primary hover:bg-primary/90 rounded-lg"
                      >
                        View Properties ({project.propertyCount})
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Projects;
