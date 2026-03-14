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
    const baseClasses = "inline-flex truncate items-center justify-center gap-2 font-serif font-medium transition-opacity duration-200";
    
    const variantClasses = {
      primary: "bg-primary-green text-soft-cream border border-primary-green",
      secondary: "bg-light-sage text-deep-charcoal border border-primary-green",
      ghost: "bg-transparent text-primary-green border border-transparent",
      outline: "bg-transparent text-primary-green border border-primary-green",
    };

    const sizeClasses = {
      sm: "px-3.5 py-1.5 text-[0.85rem]",
      md: "px-4 py-2 text-[0.925rem]",
      lg: "px-6 py-3 text-base",
    };

    const disabledClasses = disabled || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer";
    const widthClass = fullWidth ? "w-full" : "w-auto";

    const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${widthClass} ${className}`;

    const content = (
      <>
        {Icon && iconPosition === "left" && (
          <Icon className="w-4 h-4 flex-shrink-0" />
        )}
        {loading ? "Loading..." : children}
        {Icon && iconPosition === "right" && (
          <Icon className="w-4 h-4 flex-shrink-0" />
        )}
      </>
    );

    if (to) {
      return (
        <Link
          to={to}
          className={`${combinedClasses} no-underline ${disabled || loading ? "pointer-events-none" : ""}`}
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
        {...props}
      >
        {content}
      </button>
    );
  },
);

Button.displayName = "Button";
