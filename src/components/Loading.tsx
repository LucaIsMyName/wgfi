import { PalmtreeIcon } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  showBackground?: boolean;
}

const Loading = ({ message = "Laden...", size = "md", showBackground = true }: LoadingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  const containerClasses = showBackground 
    ? "animate-fade-gradient flex items-center justify-center min-h-screen bg-soft-cream"
    : "flex items-center justify-center";

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <PalmtreeIcon
            strokeWidth={1}
            className={`${sizeClasses[size]} text-primary-green animate-pulse`}
            aria-hidden="true"
          />
          <div className="absolute inset-0 animate-spin">
            <div className={`${
              size === "sm" ? "w-4 h-4" : size === "md" ? "w-8 h-8" : "w-12 h-12"
            } rounded-full border-2 border-primary-green/20 border-t-primary-green animate-spin`} />
          </div>
        </div>
        {message && (
          <p className="font-serif text-primary-green text-sm md:text-base animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton loader components
export const SkeletonCard = ({ className = "" }: { className?: string }) => (
  <div className={`bg-card-bg rounded-lg p-4 border border-primary-green/20 animate-pulse ${className}`}>
    <div className="space-y-3">
      <div className="h-4 bg-primary-green/20 rounded w-3/4"></div>
      <div className="h-3 bg-primary-green/10 rounded w-1/2"></div>
      <div className="h-3 bg-primary-green/10 rounded w-full"></div>
    </div>
  </div>
);

export const SkeletonList = ({ items = 3 }: { items?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export const SkeletonMap = () => (
  <div className="w-full h-full min-h-screen bg-card-bg animate-pulse flex items-center justify-center">
    <div className="text-center">
      <PalmtreeIcon strokeWidth={1} className="w-12 h-12 text-primary-green/30 mx-auto mb-3" />
      <p className="font-serif text-primary-green/50">Karte wird geladen...</p>
    </div>
  </div>
);

export default Loading;
