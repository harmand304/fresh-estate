import { useState, useEffect } from "react";
import { API_URL } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, Quote, Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Review {
  id: number;
  name: string;
  role: string;
  rating: number;
  text: string;
  image?: string;
  createdAt: string;
}


const Testimonials = () => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: '',
    rating: 5,
    text: ''
  });

  useEffect(() => {
    fetchReviews();
    if (user?.name) {
      setForm(prev => ({ ...prev, name: user.name || '' }));
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${API_URL}/api/website-reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.text) {
      toast.error('Please enter your name and message');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/website-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const newReview = await response.json();
        setReviews([newReview, ...reviews]);
        setForm({ name: '', role: '', rating: 5, text: '' });
        toast.success('Thank you for your feedback!');
      } else {
        toast.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? "button" : "button"}
        disabled={!interactive}
        onClick={() => interactive && setForm({ ...form, rating: i + 1 })}
        className={`focus:outline-none transition-colors ${!interactive && 'cursor-default'}`}
      >
        <Star
          className={`w-5 h-5 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
        />
      </button>
    ));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-emerald-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">What People Say About Us</h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              We're proud to have helped thousands of people find their dream homes and investments.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Reviews List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Quote className="w-5 h-5 text-emerald-600" />
                  </div>
                  Recent Reviews
                </h2>
                <span className="text-slate-500 font-medium">{reviews.length} Stories</span>
              </div>

              {loading ? (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border dashed border-slate-200">
                  <p className="text-slate-500 text-lg">Be the first to leave a review!</p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 text-xl font-bold text-slate-400">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{review.name}</h3>
                              {review.role && <p className="text-emerald-600 text-sm font-medium">{review.role}</p>}
                            </div>
                            <div className="flex">{renderStars(review.rating)}</div>
                          </div>
                          <p className="mt-3 text-slate-600 leading-relaxed text-lg">"{review.text}"</p>
                          <p className="mt-4 text-xs text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric', month: 'long', day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submission Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-28 border border-emerald-100">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Share Your Experience</h2>
                  <p className="text-slate-500">How was your journey with Fresh Estates?</p>
                </div>

                {!isAuthenticated ? (
                  <div className="text-center py-8">
                    <p className="text-slate-600 mb-4">Please log in to share your experience.</p>
                    <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Link to="/login">Log In to Review</Link>
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                        className="mt-1 bg-slate-50 border-slate-200 focus:ring-emerald-500"
                        readOnly={!!user?.name}
                      />
                    </div>

                    <div>
                      <Label htmlFor="role">Role (Optional)</Label>
                      <Input
                        id="role"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        placeholder="e.g. Homeowner, Tenant"
                        className="mt-1 bg-slate-50 border-slate-200 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <Label>Rating</Label>
                      <div className="flex gap-2 mt-2">
                        {renderStars(form.rating, true)}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Your Feedback</Label>
                      <Textarea
                        id="message"
                        value={form.text}
                        onChange={(e) => setForm({ ...form, text: e.target.value })}
                        placeholder="Tell us about your experience..."
                        className="mt-1 min-h-[120px] bg-slate-50 border-slate-200 focus:ring-emerald-500"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200" size="lg" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Review <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Testimonials;
