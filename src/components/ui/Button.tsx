import React from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
  to?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      loading = false,
      fullWidth = false,
      className = "",
      disabled,
      to,
      ...props
    },
    ref,
  ) => {
    const baseClasses = "inline-flex truncate items-center justify-center gap-2 font-serif font-medium transition-all duration-200 focus:outline-none focus:ring focus:ring-primary-green focus:ring-offset-2";
    
    const variantClasses = {
      primary: "bg-primary-green text-soft-cream border border-primary-green hover:bg-opacity-90 focus:ring-offset-soft-cream",
      secondary: "bg-light-sage text-deep-charcoal border border-primary-green hover:bg-opacity-80 focus:ring-offset-soft-cream",
      ghost: "bg-transparent text-primary-green border border-transparent hover:bg-primary-green/10 focus:ring-offset-transparent",
      outline: "bg-transparent text-primary-green border border-primary-green hover:bg-primary-green/10 focus:ring-offset-soft-cream",
    };

    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-[0.85rem]",
      md: "px-4 py-2 text-[0.925rem]",
      lg: "px-6 py-3 text-base",
    };

    const disabledClasses = disabled || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer";
    const widthClass = fullWidth ? "w-full" : "w-auto";

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`;

    const getLoadingText = () => {
      if (typeof children === 'string') {
        return loading ? `${children}...` : children;
      }
      return loading ? "Laden..." : children;
    };

    const content = (
      <>
        {loading && (
          <div 
            className="w-4 h-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        )}
        {Icon && iconPosition === "left" && !loading && (
          <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        )}
        <span className="truncate">
          {getLoadingText()}
        </span>
        {Icon && iconPosition === "right" && !loading && (
          <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        )}
      </>
    );

    if (to) {
      return (
        <Link
          to={to}
          className={`${combinedClasses} no-underline ${disabled || loading ? "pointer-events-none" : ""}`}
          aria-disabled={disabled || loading}
          role="button"
          tabIndex={disabled || loading ? -1 : 0}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={combinedClasses}
        disabled={disabled || loading}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
