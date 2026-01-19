import { useState, useEffect } from "react";
import { MessageSquare, Star, User, Calendar, Loader2 } from "lucide-react";

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AgentReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/agent/reviews`, {
        credentials: 'include'
      });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client Reviews</h1>
          <p className="text-slate-500">View feedback from your clients</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg border shadow-sm">
          <span className="text-sm text-slate-500 mr-2">Total Reviews:</span>
          <span className="font-bold text-slate-900">{reviews.length}</span>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
          <p className="text-slate-500 mt-1">
            When clients leave feedback on your profile, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{review.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {renderStars(review.rating)}
                    </div>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                      "{review.text}"
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg flex-shrink-0">
                  <Calendar className="w-4 h-4" />
                  {new Date(review.createdAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentReviews;
