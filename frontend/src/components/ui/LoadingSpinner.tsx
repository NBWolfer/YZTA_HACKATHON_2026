"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className={`${dims} border-2 border-outline-variant border-t-secondary rounded-full animate-spin`} />
  );
}

export function PageLoader({ message = "Yükleniyor..." }: { message?: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-on-surface-variant font-medium">{message}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 micro-shadow h-32 flex flex-col justify-between animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-3 w-24 bg-surface-container-high rounded" />
        <div className="h-6 w-6 bg-surface-container-high rounded" />
      </div>
      <div className="h-8 w-20 bg-surface-container-high rounded" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="grid grid-cols-12 gap-4 px-4 py-3 animate-pulse">
      <div className="col-span-2 h-4 bg-surface-container-high rounded" />
      <div className="col-span-4 flex flex-col gap-1">
        <div className="h-4 w-3/4 bg-surface-container-high rounded" />
        <div className="h-3 w-1/2 bg-surface-container-high rounded" />
      </div>
      <div className="col-span-3 h-4 w-20 bg-surface-container-high rounded" />
      <div className="col-span-3 h-4 w-16 bg-surface-container-high rounded ml-auto" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col divide-y divide-outline-variant">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}
