import { useState, useEffect } from "react";
import { PalmtreeIcon, TreesIcon, Flower2Icon } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  showBackground?: boolean;
  variant?: "default" | "map" | "skeleton";
}

const Loading = ({ 
  message = "Laden...", 
  size = "md", 
  showBackground = true,
  variant = "default"
}: LoadingProps) => {
  const [currentIconIndex, setCurrentIconIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  
  const icons = [PalmtreeIcon, TreesIcon, Flower2Icon];
  const CurrentIcon = icons[currentIconIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      
      setTimeout(() => {
        setCurrentIconIndex((prev) => (prev + 1) % icons.length);
        setIsFading(false);
      }, 300); // Fade duration
    }, 2000); // Switch every 2 seconds

    return () => clearInterval(interval);
  }, [icons.length]);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  // Variant-specific configurations
  const getVariantConfig = () => {
    switch (variant) {
      case "map":
        return {
          container: "w-full h-full min-h-screen bg-card-bg animate-pulse flex items-center justify-center",
          iconColor: "text-primary-green/30",
          textColor: "text-primary-green/50",
          message: "Karte wird geladen...",
          showSpinner: false
        };
      case "skeleton":
        return {
          container: "animate-pulse",
          iconColor: "text-primary-green/20",
          textColor: "text-primary-green/30",
          message: "",
          showSpinner: false
        };
      default:
        return {
          container: showBackground 
            ? "flex items-center justify-center min-h-screen bg-soft-cream"
            : "flex items-center justify-center",
          iconColor: "text-primary-green",
          textColor: "text-primary-green",
          message,
          showSpinner: true
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div className={config.container} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <CurrentIcon
            strokeWidth={1}
            className={`${sizeClasses[size]} ${config.iconColor} transition-opacity duration-300 ${
              isFading ? 'opacity-0' : 'opacity-100'
            } ${variant === "default" ? "animate-fade-gradient" : ""} motion-reduce:animate-none`}
            aria-hidden="true"
          />
          {config.showSpinner && (
            <div className="absolute inset-0 animate-spin motion-reduce:animate-none">
              <div className={`${
                size === "sm" ? "w-4 h-4" : size === "md" ? "w-8 h-8" : "w-12 h-12"
              } rounded-full animate-pulse motion-reduce:animate-none`} />
            </div>
          )}
        </div>
        {config.message && (
          <p className={`font-serif ${
            variant === "default" ? "animate-pulse-reverse" : ""
          } ${config.textColor} text-sm md:text-base motion-reduce:animate-none`}>
            {config.message}
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

// Export the main Loading component as default
export default Loading;
