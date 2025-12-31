
import { Skeleton } from "@/components/ui/skeleton";

export const PropertyDetailsSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar Skeleton Placeholder */}
      <div className="h-20 w-full border-b" />

      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button Skeleton */}
          <Skeleton className="w-32 h-10 mb-6 rounded-md" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Image Skeleton */}
              <Skeleton className="w-full aspect-video rounded-3xl" />

              {/* Header Info Skeleton */}
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2 w-full max-w-lg">
                    <Skeleton className="w-3/4 h-10" />
                    <Skeleton className="w-1/2 h-6" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="w-32 h-10" />
                  </div>
                </div>

                {/* Key Stats Grid Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl w-full" />
                  ))}
                </div>

                {/* Description Skeleton */}
                <div className="space-y-2">
                    <Skeleton className="w-1/4 h-8 mb-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-full h-4" />
                    <Skeleton className="w-3/4 h-4" />
                    <Skeleton className="w-full h-4" />
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
               <Skeleton className="w-full h-[400px] rounded-3xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
