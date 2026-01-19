import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use placeholder if no images
  const displayImages = images.length > 0 ? images : [];
  const hasImages = displayImages.length > 0;

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  };

  // Placeholder component
  const ImagePlaceholder = ({ className = "" }: { className?: string }) => (
    <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      <span className="text-sm text-slate-500">No Image</span>
    </div>
  );

  if (!hasImages) {
    return (
      <div className="rounded-2xl overflow-hidden bg-slate-100 h-[400px]">
        <ImagePlaceholder className="w-full h-full" />
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery Grid - Figma Design */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
        {/* Main Large Image */}
        <div 
          className="col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={displayImages[0]}
            alt={`${title} - Main`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23f1f5f9' width='400' height='300'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Top Right Images */}
        {[1, 2].map((idx) => (
          <div 
            key={idx}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => displayImages[idx] && openLightbox(idx)}
          >
            {displayImages[idx] ? (
              <img
                src={displayImages[idx]}
                alt={`${title} - ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <ImagePlaceholder className="w-full h-full" />
            )}
          </div>
        ))}

        {/* Bottom Right Images */}
        {[3, 4].map((idx) => (
          <div 
            key={idx}
            className="relative cursor-pointer group overflow-hidden"
            onClick={() => displayImages[idx] && openLightbox(idx)}
          >
            {displayImages[idx] ? (
              <>
                <img
                  src={displayImages[idx]}
                  alt={`${title} - ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {/* View All Photos overlay on last visible image */}
                {idx === 4 && displayImages.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white transition-opacity hover:bg-black/60">
                    <div className="flex items-center gap-2 font-medium">
                      <Images className="w-5 h-5" />
                      View All Photos
                    </div>
                  </div>
                )}
              </>
            ) : (
              <ImagePlaceholder className="w-full h-full" />
            )}
          </div>
        ))}
      </div>

      {/* View All Photos Button (if more than 5 images) */}
      {displayImages.length > 5 && (
        <button
          onClick={() => openLightbox(0)}
          className="mt-3 flex items-center gap-2 text-sm text-primary font-medium hover:underline"
        >
          <Images className="w-4 h-4" />
          View all {displayImages.length} photos
        </button>
      )}

      {/* Lightbox Modal */}
      {showLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Image Counter */}
          <div className="absolute top-4 left-4 text-white/80 text-sm">
            {currentIndex + 1} / {displayImages.length}
          </div>

          {/* Previous Button */}
          <button
            onClick={prevImage}
            className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Current Image */}
          <img
            src={displayImages[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="max-h-[85vh] max-w-[85vw] object-contain rounded-lg"
          />

          {/* Next Button */}
          <button
            onClick={nextImage}
            className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Thumbnail Strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === idx ? "border-white scale-110" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
