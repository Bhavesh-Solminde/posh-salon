import { PageHeaderSkeleton, TableSkeleton } from "@/components/admin/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div>
      <PageHeaderSkeleton />
      <div className="p-4 sm:p-6">
        <TableSkeleton />
      </div>
      <span className="sr-only" role="status">
        Loading…
      </span>
    </div>
  );
}
