import { Skeleton } from "@/components/ui/skeleton";

export const AgentCardSkeleton = () => {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-soft border border-slate-100 h-full">
            <div className="relative h-64">
                <Skeleton className="w-full h-full" />
                <div className="absolute top-4 right-4">
                    <Skeleton className="w-24 h-6 rounded-full" />
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>

                <div className="flex justify-between py-4 border-y border-slate-50">
                    <div className="text-center space-y-1">
                        <Skeleton className="h-5 w-8 mx-auto" />
                        <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                    <div className="text-center space-y-1">
                        <Skeleton className="h-5 w-8 mx-auto" />
                        <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                    <div className="text-center space-y-1">
                        <Skeleton className="h-5 w-8 mx-auto" />
                        <Skeleton className="h-3 w-12 mx-auto" />
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Skeleton className="h-10 flex-1 rounded-xl" />
                    <Skeleton className="h-10 w-10 rounded-xl" />
                </div>
            </div>
        </div>
    );
};
