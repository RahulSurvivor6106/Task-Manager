import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto grid min-h-screen max-w-[1680px] gap-6 px-4 py-4 lg:px-6">
      <Skeleton className="h-28 rounded-[1.75rem]" />
      <div className="grid gap-4 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[1.5rem]" />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Skeleton className="h-[340px] rounded-[1.5rem]" />
        <Skeleton className="h-[340px] rounded-[1.5rem]" />
      </div>
      <Skeleton className="h-[560px] rounded-[1.5rem]" />
    </div>
  );
}
