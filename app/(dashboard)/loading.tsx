import { Skeleton, SkeletonCard, SkeletonTable } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 border-b border-line pb-4">
        <Skeleton className="h-7 w-64" />
        <Skeleton className="h-3 w-96" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>

      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
