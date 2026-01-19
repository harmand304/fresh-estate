import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Star,
  Award,
  Calendar,
  Home,
  Bed,
  Bath,
  Maximize,
  ChevronRight,
  MessageSquare,
  User,
  Send,
  Loader2,
  Share2
} from 'lucide-react';

interface Property {
  id: string;
  title: string;
  price: number;
  purpose: string;
  bedrooms: number;
  bathrooms: number;
  sqm: number;
  image: string;
  city: string;
  area: string;
  type: string;
}

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
}

interface Agent {
  id: number;
  name: string;
  phone: string;
  email: string;
  bio: string;
  image: string;
  website: string;
  experience: number;
  rating: number;
  reviewCount: number;
  specialties: string[];
  officeAddress: string;
  officeLat: number;
  officeLng: number;
  isTopAgent: boolean;
  cityName: string;
  propertyCount: number;
  properties: Property[];
  reviews: Review[];
}

const API_URL = `http://${window.location.hostname}:3001`;

const AgentProfile = () => {
  const { id } = useParams();
  const { isAgent } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    text: ''
  });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/agents/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAgent(data);
        }
      } catch (error) {
        console.error('Error fetching agent:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkReviewPermission = async () => {
       try {
         const res = await fetch(`${API_URL}/api/agents/${id}/can-review`, {
           credentials: 'include'
         });
         const data = await res.json();
         setCanReview(data.canReview);
       } catch (error) {
         console.error('Error checking permission:', error);
       }
    };

    fetchAgent();
    checkReviewPermission();
  }, [id]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      // Send message as a general inquiry to the agent
      const res = await fetch(`${API_URL}/api/agents/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          phone: contactForm.phone,
          message: contactForm.message
        })
      });

      if (res.ok) {
        toast.success('Message sent successfully! The agent will respond within 24 hours.');
        setContactForm({ name: '', email: '', phone: '', message: '' });
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.text) {
      toast.error('Please provide both your name and feedback');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/agents/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewForm)
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Feedback submitted successfully!');
        setReviewForm({ name: '', rating: 5, text: '' });
        // Update local agent state with new review
        if (agent) {
          setAgent({
            ...agent,
            reviews: [data.review, ...agent.reviews],
            rating: (agent.rating * agent.reviewCount + data.review.rating) / (agent.reviewCount + 1),
            reviewCount: agent.reviewCount + 1
          });
        }
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-lg h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900">Agent Not Found</h1>
            <Button asChild className="mt-4">
              <Link to="/properties">Browse Properties</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Agent Hero */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Profile Image */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-lg overflow-hidden border-4 border-primary/20 flex-shrink-0">
                {agent.image ? (
                  <img src={agent.image} alt={agent.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <User className="w-16 h-16 text-primary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-slate-900">{agent.name}</h1>
                  {agent.isTopAgent && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg flex items-center gap-1">
                      <Award className="w-4 h-4" /> TOP 1%
                    </span>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 rounded-full text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 transition-colors ml-auto md:ml-2"
                    onClick={async () => {
                      try {
                        if (navigator.share) {
                          await navigator.share({
                            title: agent.name,
                            text: `Check out this real estate agent: ${agent.name}`,
                            url: window.location.href,
                          });
                        } else {
                          await navigator.clipboard.writeText(window.location.href);
                          toast.success("Profile link copied!", {
                            description: "You can now share this agent with others."
                          });
                        }
                      } catch (err) {
                        console.error("Share failed:", err);
                        if (err instanceof Error && err.name !== 'AbortError') {
                           try {
                             await navigator.clipboard.writeText(window.location.href);
                             toast.success("Profile link copied!");
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
                
                <p className="text-primary font-medium mt-1">{agent.cityName} Real Estate Specialist</p>

                {/* Stats */}
                <div className="flex gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{agent.propertyCount}+</p>
                    <p className="text-sm text-slate-500">DEALS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-900">{agent.experience || 0}</p>
                    <p className="text-sm text-slate-500">YEARS</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-2xl font-bold text-slate-900">{agent.rating ? Number(agent.rating).toFixed(1) : 0}</p>
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-sm text-slate-500">RATING</p>
                  </div>
                </div>
              </div>

              {/* Contact Buttons */}
              <div className="flex gap-3">
                {agent.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${agent.phone}`}>
                      <Phone className="w-4 h-4 mr-2" /> Call Agent
                    </a>
                  </Button>
                )}
                {agent.email && (
                  <Button variant="outline" asChild>
                    <a href={`mailto:${agent.email}`}>
                      <Mail className="w-4 h-4 mr-2" /> Email Agent
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  About {agent.name.split(' ')[0]}
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  {agent.bio || `${agent.name} is a dedicated real estate professional serving the ${agent.cityName} area.`}
                </p>

                {/* Specialties */}
                {agent.specialties && agent.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {agent.specialties.map((specialty, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Listings */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Home className="w-5 h-5 text-primary" />
                    Active Listings ({agent.properties.length})
                  </h2>
                  <Link to="/properties" className="text-primary hover:underline flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                {agent.properties.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No active listings</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {agent.properties.slice(0, 4).map((property) => (
                      <Link
                        key={property.id}
                        to={`/property/${property.id}`}
                        className="group rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-shadow"
                      >
                        <div className="aspect-[4/3] bg-slate-200 overflow-hidden relative">
                          {property.image && (
                            <img
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          )}
                          <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-semibold rounded ${
                            property.purpose === 'SALE' ? 'bg-primary text-white' : 'bg-blue-500 text-white'
                          }`}>
                            FOR {property.purpose}
                          </span>
                        </div>
                        <div className="p-3">
                          <p className="text-lg font-bold text-primary">${property.price.toLocaleString()}</p>
                          <p className="font-medium text-slate-900 truncate">{property.title}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {property.area}, {property.city}
                          </p>
                          <div className="flex gap-3 mt-2 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Bed className="w-4 h-4" /> {property.bedrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="w-4 h-4" /> {property.bathrooms}
                            </span>
                            <span className="flex items-center gap-1">
                              <Maximize className="w-4 h-4" /> {property.sqm}m²
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Client Reviews */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Client Stories
                </h2>

                {agent.reviews.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {agent.reviews.map((review) => (
                      <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0">
                        <div className="flex items-center gap-1 mb-2">
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-slate-600 italic">"{review.text}"</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{review.name}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add Feedback Form - Only for VERIFIED CLIENTS */}
              {!isAgent && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Add Your Feedback
                  </h2>
                  
                  {canReview ? (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* ... form content ... */}
                      <div>
                        <Label htmlFor="review-name">Your Name</Label>
                        <Input
                          id="review-name"
                          value={reviewForm.name}
                          onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          placeholder="Enter your name"
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label>Rating</Label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              className={`focus:outline-none transition-colors ${
                                star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="review-text">Your Feedback</Label>
                        <textarea
                          id="review-text"
                          value={reviewForm.text}
                          onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                          placeholder="Share your experience working with this agent..."
                          className="w-full mt-1 min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          required
                        />
                      </div>

                      <Button type="submit" disabled={submittingReview} className="w-full">
                        {submittingReview ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          'Submit Feedback'
                        )}
                      </Button>
                    </form>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                      <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Award className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="font-semibold text-slate-800">Verified Clients Only</h3>
                      <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
                        To ensure authenticity, only clients who have completed a purchase or rental with this agent can leave a review.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-28">
                <div className="bg-primary text-white p-4 text-center">
                  <p className="font-semibold">Contact {agent.name.split(' ')[0]}</p>
                  <p className="text-sm text-white/80">Get in touch directly</p>
                </div>
                <div className="p-6">

                {/* Contact Info */}
                <div className="space-y-4">
                  {agent.phone && (
                    <a 
                      href={`tel:${agent.phone}`} 
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-primary/10 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Phone className="w-5 h-5 text-primary group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="font-medium text-slate-900">{agent.phone}</p>
                      </div>
                    </a>
                  )}
                  {agent.email && (
                    <a 
                      href={`mailto:${agent.email}`} 
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-primary/10 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Mail className="w-5 h-5 text-primary group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="font-medium text-slate-900">{agent.email}</p>
                      </div>
                    </a>
                  )}
                  {agent.website && (
                    <a 
                      href={agent.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-primary/10 transition-colors group"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Globe className="w-5 h-5 text-primary group-hover:text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Website</p>
                        <p className="font-medium text-slate-900">Visit Website</p>
                      </div>
                    </a>
                  )}
                </div>

                {/* Office Location */}
                {agent.officeAddress && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="font-semibold text-slate-900 mb-2">Office Location</p>
                    <div className="bg-slate-100 rounded-lg p-3 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                        <p className="text-sm text-slate-600">{agent.officeAddress}</p>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AgentProfile;
