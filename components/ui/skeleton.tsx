export function SkeletonPanel() {
  return (
    <div className="grid gap-4">
      <div className="h-24 animate-pulse rounded-lg bg-[#dfece4]" />
      <div className="h-40 animate-pulse rounded-lg bg-[#e8f2ec]" />
      <div className="h-32 animate-pulse rounded-lg bg-[#e8f2ec]" />
    </div>
  );
}
