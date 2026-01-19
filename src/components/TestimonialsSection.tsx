import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "./ui/button";

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  image?: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TestimonialsSection = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/website-reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Default reviews if none from API (for illustration until user adds some)
  const displayReviews = reviews.length > 0 ? reviews.slice(0, 3) : [
    {
      id: 0,
      name: "Sarah Jenkins",
      role: "Homeowner in Green Valley",
      rating: 5,
      text: "FreshEstates made finding a solar-powered home incredibly easy. The agent we connected with was knowledgeable and passionate about sustainability."
    },
    {
      id: -1,
      name: "Michael Ross",
      role: "Tenant in Eco District",
      rating: 5,
      text: "I was skeptical about finding an eco-friendly rental, but this platform proved me wrong. The process was smooth, and I love my new energy-efficient apartment!"
    }
  ];

  return (
    <section className="py-20 bg-emerald-500 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">
            Hear from people who found their perfect home using our platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayReviews.map((review) => (
            <div key={review.id} className="bg-white text-slate-900 rounded-2xl p-8 shadow-xl hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="flex gap-1 mb-4">
                {renderStars(review.rating)}
              </div>
              <p className="text-lg italic text-slate-700 mb-6 font-medium leading-relaxed">
                "{review.text}"
              </p>
              <div className="flex items-center gap-4 border-t pt-4 border-slate-100">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  {review.image ? (
                    <img src={review.image} alt={review.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <span className="text-emerald-600 font-bold text-lg">{review.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{review.name}</h4>
                  <p className="text-sm text-slate-500">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Button 
            asChild 
            variant="secondary" 
            size="lg" 
            className="bg-white text-emerald-600 hover:bg-slate-100 font-bold rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
          >
            <Link to="/testimonials">
              Show All Comments <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
