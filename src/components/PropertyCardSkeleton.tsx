
import { Skeleton } from "@/components/ui/skeleton";

export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-soft border border-border h-full">
      {/* Image Skeleton */}
      <div className="relative">
        <Skeleton className="w-full h-56" />
        {/* Badge Skeleton */}
        <Skeleton className="absolute top-4 left-4 w-20 h-7 rounded-full" />
        {/* Price Skeleton */}
        <div className="absolute bottom-4 left-4 right-4">
             <Skeleton className="w-32 h-10 rounded-lg" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-5 space-y-4">
        {/* Type & Title */}
        <div className="space-y-2">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-full h-6" />
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
           <Skeleton className="w-4 h-4 rounded-full" />
           <Skeleton className="w-2/3 h-4" />
        </div>

        {/* Features Grid */}
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
          <Skeleton className="w-16 h-4" />
        </div>

        {/* Buttons */}
        <div className="pt-2">
          <Skeleton className="w-full h-10 rounded-md" />
        </div>
      </div>
    </div>
  );
};
