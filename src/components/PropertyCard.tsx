import { Link } from "react-router-dom";
import { Bed, Bath, Maximize, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface PropertyCardProps {
  id: string;
  image: string;
  title: string;
  type: "Apartment" | "House" | "Villa" | "Office" | "Commercial" | "Land" | "Plot";
  purpose: "RENT" | "SALE";
  price: number;
  city: string;
  area: string;
  sqm: number;
  bedrooms: number;
  bathrooms: number;
  hasGarage?: boolean;
  hasBalcony?: boolean;
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
}

const PropertyCard = ({
  id,
  image,
  title,
  type,
  purpose,
  price,
  city,
  area,
  sqm,
  bedrooms,
  bathrooms,
  isFavorited = false,
  onToggleFavorite,
}: PropertyCardProps) => {
  const { isAuthenticated } = useAuth();

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price || 0);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(id);
    }
  };

  return (
    <Link to={`/property/${id}`} className="group block">
      <article className="bg-white rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        {/* Image Container */}
        <div className="relative aspect-[3/2] overflow-hidden m-1.5 rounded-md">
          {image ? (
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const placeholder = target.parentElement?.querySelector('.image-placeholder');
                if (placeholder) placeholder.classList.remove('hidden');
              }}
            />
          ) : null}
          {/* Placeholder for null or broken images */}
          <div className={`image-placeholder w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center ${image ? 'hidden' : ''}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>

          {/* NEW Badge */}
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold rounded-md bg-primary text-white uppercase">
            {purpose === "SALE" ? "NEW" : "RENT"}
          </span>

          {/* Favorite Heart Button */}
          {isAuthenticated && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${isFavorited
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 text-gray-500 hover:bg-white hover:text-red-500'
                }`}
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-2 pb-1.5">
          {/* Price */}
          <span className="text-sm font-bold text-foreground block -mt-0.5">{formattedPrice}</span>

          {/* Title */}
          {title && (
            <h3 className="text-xs font-medium text-foreground truncate mt-0.5">{title}</h3>
          )}

          {/* Address */}
          {(area || city) && (
            <p className="text-primary text-[10px] font-medium mb-1 line-clamp-1 truncate opacity-90">
              {[area, city].filter(Boolean).join(', ')}
            </p>
          )}

          {/* Features */}
          <div className="flex items-center gap-2 text-muted-foreground text-[9px] font-medium">
            <span className="flex items-center gap-0.5"><Bed className="w-2.5 h-2.5" />{bedrooms || 0}</span>
            <span className="flex items-center gap-0.5"><Bath className="w-2.5 h-2.5" />{bathrooms || 0}</span>
            <span className="flex items-center gap-0.5"><Maximize className="w-2.5 h-2.5" />{sqm || 0} m²</span>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default PropertyCard;