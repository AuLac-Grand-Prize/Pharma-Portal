import { Skeleton, SkeletonCard } from "@/components/ui";

export default function EnginesLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-line pb-4">
        <Skeleton className="h-7 w-72" />
        <Skeleton className="h-3 w-96" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
