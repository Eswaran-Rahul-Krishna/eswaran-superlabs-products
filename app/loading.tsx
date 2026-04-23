import { Skeleton } from "@/components/ui/skeleton";

// Shown only on the very first navigation before the page shell streams in.
export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4 py-8">
        <Skeleton className="h-10 w-64 mx-auto" />
        <Skeleton className="h-5 w-80 mx-auto" />
        <div className="flex justify-center">
          <Skeleton className="h-10 w-72 rounded-full" />
        </div>
      </div>
    </div>
  );
}
