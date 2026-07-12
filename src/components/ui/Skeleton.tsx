export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton rounded-[var(--radius-md)] ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonText({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3.5 ${i === lines - 1 && lines > 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}
