import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Property } from "@/hooks/useProperties";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyCarouselProps {
  properties: Property[];
  loading?: boolean;
}

const PropertyCarousel = ({ properties, loading }: PropertyCarouselProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev">("next");

  // Use top 5 properties for carousel - Filter out invalid ones first
  const slides = (properties || [])
    .filter(p => p && p.image && p.title) // Only show properties with images and titles
    .slice(0, 5);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection("next");
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  }, [slides.length, isAnimating]);

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSlideDirection("prev");
    setTimeout(() => {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setSlideDirection(index > currentSlide ? "next" : "prev");
    setTimeout(() => {
      setCurrentSlide(index);
      setTimeout(() => setIsAnimating(false), 50);
    }, 300);
  };

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;

    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <Skeleton className="h-[280px] md:h-[350px] w-full rounded-2xl" />
        </div>
      </section>
    );
  }

  if (slides.length === 0) return null;

  const currentProperty = slides[currentSlide];
  const nextPropertyIndex = (currentSlide + 1) % slides.length;
  const nextProperty = slides[nextPropertyIndex];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-primary font-semibold text-sm uppercase tracking-wide">
                Spotlight
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">
              Featured Highlights
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              aria-label="Previous slide"
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-slate-100 transition-all duration-300 hover:scale-110 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              aria-label="Next slide"
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all duration-300 hover:scale-110 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="flex gap-6 overflow-hidden">
            {/* Main Featured Card */}
            <div className="flex-[2] min-w-0">
              <div
                className={`relative h-[280px] md:h-[350px] rounded-3xl overflow-hidden group transition-all duration-500 ease-out ${isAnimating
                  ? slideDirection === "next"
                    ? "opacity-0 translate-x-8 scale-95"
                    : "opacity-0 -translate-x-8 scale-95"
                  : "opacity-100 translate-x-0 scale-100"
                  }`}
              >
                <img
                  src={currentProperty.image}
                  alt={currentProperty.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 transition-all duration-500 delay-100 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                  }`}>
                  {/* Badge */}
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded-lg mb-4 animate-fade-up">
                    Exclusive
                  </span>

                  {/* Title */}
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-3">
                    {currentProperty.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/80 text-sm mb-4 max-w-md line-clamp-2">
                    {currentProperty.shortDescription || currentProperty.description || "An architectural triumph blending luxury with modern living. Features premium amenities and stunning views."}
                  </p>

                  {/* View Property Button */}
                  <Link
                    to={`/property/${currentProperty.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 hover:scale-105"
                  >
                    View Property
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Next Property Preview */}
            <div className="hidden lg:block flex-1 min-w-0">
              <div
                className={`relative h-[280px] md:h-[350px] rounded-3xl overflow-hidden group cursor-pointer transition-all duration-500 ease-out delay-150 ${isAnimating
                  ? "opacity-0 translate-x-12 scale-95"
                  : "opacity-100 translate-x-0 scale-100"
                  }`}
                onClick={nextSlide}
              >
                <img
                  src={nextProperty.image}
                  alt={nextProperty.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Subtle Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />

                {/* Minimal Content */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 transition-all duration-500 delay-200 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
                  }`}>
                  <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold uppercase rounded-lg mb-3">
                    {nextProperty.purpose === "SALE" ? "For Sale" : "For Rent"}
                  </span>
                  <h4 className="text-xl font-bold text-white">
                    {nextProperty.title}
                  </h4>
                </div>

                {/* Click Indicator */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                  <ChevronRight className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-500 ease-out ${currentSlide === index
                  ? "bg-primary w-8"
                  : "bg-slate-300 w-2 hover:bg-slate-400 hover:w-4"
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyCarousel;