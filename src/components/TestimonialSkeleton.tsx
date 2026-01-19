import { Skeleton } from "@/components/ui/skeleton";

export const TestimonialSkeleton = () => {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-slate-100 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>

            <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="w-4 h-4 mr-1" />
                ))}
            </div>

            <div className="space-y-2 flex-grow">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            <div className="mt-6 flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    );
};
