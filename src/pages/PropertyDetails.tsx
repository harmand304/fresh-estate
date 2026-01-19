import { useEffect, useState } from "react";
import { API_URL } from "@/config";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin, Bed, Bath, Maximize, Car, Home, Star, ChevronRight,
  Waves, Dumbbell, Snowflake, Wifi, Sun, Plug, Shield, Flame,
  Shirt, ChefHat, Flower2, DoorOpen, PawPrint, ArrowUpDown,
  Bell, Building, Archive, UserCircle, Loader2, Share2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Breadcrumb from "@/components/Breadcrumb";
import ImageGallery from "@/components/ImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PropertyDetailsSkeleton } from "@/components/PropertyDetailsSkeleton";
import { LocationReviews } from "@/components/LocationReviews";
import { toast } from "sonner";


// Icon mapping based on database seed values
const amenityIcons: Record<string, any> = {
  'waves': Waves,
  'dumbbell': Dumbbell,
  'snowflake': Snowflake,
  'wifi': Wifi,
  'sun': Sun,
  'plug': Plug,
  'shield': Shield,
  'home': Home,
  'flame': Flame,
  'shirt': Shirt,
  'chef-hat': ChefHat,
  'flower': Flower2,
  'car': Car,
  'door-open': DoorOpen,
  'paw-print': PawPrint,
  'arrow-up-down': ArrowUpDown,
  'bell': Bell,
  'building': Building,
  'archive': Archive,
};

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: 'Hello, I am interested in this property...'
  });

  // Initial loading delay to let images load
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 2000); // 2 seconds delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${API_URL}/api/properties/${id}`);
        if (res.ok) {
          const data = await res.json();
          setProperty(data);
        }
      } catch (error) {
        console.error('Error fetching property:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  const handleSubmit = async (type: 'TOUR' | 'MESSAGE') => {
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!property.agentId) {
      toast.error('No agent assigned to this property');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          agentId: property.agentId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          type
        })
      });

      if (res.ok) {
        toast.success(type === 'TOUR'
          ? 'Tour request sent successfully! The agent will contact you soon.'
          : 'Message sent successfully!');
        setFormData({ name: '', email: '', phone: '', message: 'Hello, I am interested in this property...' });
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <Button asChild>
          <Link to="/properties">Back to Properties</Link>
        </Button>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(property.price);

  // Use actual description from database (no placeholder)
  const description = property.description || '';
  const truncatedDescription = description.slice(0, 400);

  // Estimated payment calculation
  const monthlyPayment = property.purpose === 'RENT'
    ? property.price
    : Math.round(property.price / 360); // 30-year mortgage rough estimate

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
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: property.purpose === 'SALE' ? "Buy" : "Rent", href: "/properties" },
              { label: property.city, href: `/properties?city=${property.city}` },
              { label: property.area }
            ]}
            className="mb-4"
          />

          {/* Image Gallery */}
          <ImageGallery
            images={property.images || (property.image ? [property.image] : [])}
            title={property.title}
          />

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Price and Title Section */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    {formattedPrice}
                    {property.purpose === "RENT" && <span className="text-lg text-muted-foreground font-normal">/mo</span>}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-lg ${property.dealStatus === 'COMPLETED'
                    ? "bg-red-500 text-white"
                    : property.purpose === 'SALE' ? "bg-primary/10 text-primary" : "bg-blue-500 text-white"
                    }`}>
                    {property.dealStatus === 'COMPLETED'
                      ? (property.completedDealType === 'SALE' ? "Sold" : "Rented")
                      : (property.purpose === 'SALE' ? 'Active Listing' : 'For Rent')
                    }
                  </span>
                  {property.purpose === 'SALE' && property.dealStatus !== 'COMPLETED' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-lg">
                      New Construction
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">
                      {property.title}
                    </h1>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {property.area}, {property.city}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-full text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: property.title,
                            text: `Check out this property: ${property.title}`,
                            url: window.location.href,
                          });
                        } else {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied to clipboard!", {
                            description: "You can now paste it to share with friends."
                          });
                        }
                      } catch (err) {
                        console.error("Share failed:", err);
                        // Fallback to clipboard if share fails (e.g. user cancelled)
                        if (err instanceof Error && err.name !== 'AbortError') {
                          try {
                            await navigator.clipboard.writeText(window.location.href);
                            toast.success("Link copied to clipboard!");
                          } catch (clipboardErr) {
                            toast.error("Failed to share link");
                          }
                        }
                      }
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Key Stats */}
              <div className="flex flex-wrap gap-6 py-6 border-y border-border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Bed className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.bedrooms}</p>
                    <p className="text-sm text-muted-foreground uppercase">Bedrooms</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Bath className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.bathrooms}</p>
                    <p className="text-sm text-muted-foreground uppercase">Bathrooms</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                    <Maximize className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{property.sqm?.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground uppercase">m²</p>
                  </div>
                </div>

                {property.hasGarage && (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Car className="w-6 h-6 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">2</p>
                      <p className="text-sm text-muted-foreground uppercase">Garage</p>
                    </div>
                  </div>
                )}
              </div>

              {/* About This Home - Only show if description exists */}
              {description && (
                <div>
                  <h2 className="text-xl font-bold mb-4">About this home</h2>
                  <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {showFullDescription ? description : truncatedDescription}
                    {description.length > 400 && !showFullDescription && "..."}
                  </div>
                  {description.length > 400 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-primary font-medium mt-3 hover:underline"
                    >
                      {showFullDescription ? "Show less" : "Read more →"}
                    </button>
                  )}
                </div>
              )}

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-bold mb-4">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Show database amenities if available */}
                  {property.amenities && property.amenities.length > 0 ? (
                    property.amenities.map((amenity: any, idx: number) => {
                      const IconComponent = amenity.icon ? amenityIcons[amenity.icon] : null;
                      return (
                        <div key={idx} className="flex items-center gap-3 text-foreground">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            {IconComponent ? (
                              <IconComponent className="w-4 h-4 text-primary" />
                            ) : (
                              <span className="text-primary text-sm">✓</span>
                            )}
                          </div>
                          <span>{amenity.name}</span>
                        </div>
                      );
                    })
                  ) : (
                    /* Fallback to boolean fields if no amenities in DB */
                    <>
                      {property.hasGarage && (
                        <div className="flex items-center gap-3 text-foreground">
                          <Car className="w-5 h-5 text-primary" />
                          <span>Garage</span>
                        </div>
                      )}
                      {property.hasBalcony && (
                        <div className="flex items-center gap-3 text-foreground">
                          <Home className="w-5 h-5 text-primary" />
                          <span>Balcony</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-foreground text-muted-foreground italic">
                        <span>No amenities listed</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Location Reviews */}
              {property.locationId && (
                <LocationReviews
                  locationId={property.locationId}
                  locationName={property.area || "this location"}
                />
              )}
            </div>


            {/* Sidebar - Agent Contact */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                {/* Agent Info - Clickable */}
                <Link to={`/agents/${property.agentId}`} className="flex items-center gap-3 mb-6 hover:bg-slate-50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center overflow-hidden">
                    {property.agentImage ? (
                      <img
                        src={property.agentImage}
                        alt={property.agent}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{property.agent || "Property Agent"}</h3>
                    <p className="text-sm text-muted-foreground">Premier Agent</p>
                  </div>
                  {property.agentRating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">{property.agentRating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({property.agentReviewCount} reviews)</span>
                    </div>
                  )}
                </Link>

                {/* Contact Form */}
                <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
                  <Input
                    placeholder="Name"
                    className="h-11"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={submitting}
                  />
                  <Input
                    placeholder="Email"
                    type="email"
                    className="h-11"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={submitting}
                  />
                  <Input
                    placeholder="Phone"
                    type="tel"
                    className="h-11"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={submitting}
                  />
                  <Textarea
                    placeholder="Hello, I am interested in this property..."
                    className="min-h-[80px] resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={submitting}
                  />
                  <Button
                    className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90"
                    onClick={() => handleSubmit('TOUR')}
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request a Tour'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base font-semibold rounded-xl"
                    onClick={() => handleSubmit('MESSAGE')}
                    disabled={submitting}
                  >
                    Send Message
                  </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground mt-6">
                  Reference ID: {property.id?.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PropertyDetails;
