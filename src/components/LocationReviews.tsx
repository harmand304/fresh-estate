import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string | null;
  } | null;
}

interface LocationReviewsProps {
  locationId: number;
  locationName: string;
}

export const LocationReviews = ({ locationId, locationName }: LocationReviewsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dynamic API URL based on current hostname
  const API_URL = `http://${window.location.hostname}:3001`;

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ["location-reviews", locationId],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/locations/${locationId}/reviews`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json();
    },
    enabled: !!locationId,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      console.log(`Submitting review to ${API_URL}/api/locations/${locationId}/reviews`);
      const res = await fetch(`${API_URL}/api/locations/${locationId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", 
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${res.status}`);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["location-reviews", locationId] });
      setComment("");
      setRating(5);
      toast.success("Review submitted successfully");
    },
    onError: (error: Error) => {
      console.error("Review submission failed:", error);
      toast.error(`Failed: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to leave a review");
      return;
    }
    setIsSubmitting(true);
    mutation.mutate();
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "N/A";

  return (
    <div className="mt-12 bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-serif font-bold text-gray-900">
          Reviews for {locationName}
        </h2>
        <div className="ml-auto flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <span className="font-semibold text-lg">{averageRating}</span>
          <span className="text-gray-500 text-sm">({reviews.length} reviews)</span>
        </div>
      </div>

      <div className="space-y-8">
        {/* Review List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-500 italic mb-4">No reviews yet. Be the first to share your experience!</p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="bg-primary text-white">
                  Write a Review
                </Button>
              )}
            </div>
          ) : (
            <>
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">{review.user?.name || "Anonymous User"}</span>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
              
              {!showForm && (
                <div className="flex justify-center pt-8 border-t border-gray-100">
                  <Button onClick={() => setShowForm(true)} size="lg" className="bg-primary text-white shadow-lg shadow-primary/20">
                    Write a Review
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Submit Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share your experience</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What is it like living in this area? (Traffic, safety, amenities...)"
                  required
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
              {!user && (
                <p className="text-xs text-center text-gray-500 mt-2">
                  Please login to write a review
                </p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
