import React from "react";
import type { LucideIcon } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  loading?: boolean;
  fullWidth?: boolean;
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
      style,
      ...props
    },
    ref,
  ) => {
    const getVariantStyles = (): React.CSSProperties => {
      const baseStyles: React.CSSProperties = {
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "opacity 0.2s ease",
        border: "1px solid transparent"
      };

      switch (variant) {
        case "primary":
          return {
            ...baseStyles,
            backgroundColor: "var(--primary-green)",
            color: "var(--soft-cream)",
            border: "1px solid var(--primary-green)",
          };
        case "secondary":
          return {
            ...baseStyles,
            backgroundColor: "var(--light-sage)",
            color: "var(--deep-charcoal)",
            border: "1px solid var(--light-sage)",
          };
        case "ghost":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: "var(--primary-green)",
            border: "1px solid transparent",
          };
        case "outline":
          return {
            ...baseStyles,
            backgroundColor: "transparent",
            color: "var(--primary-green)",
            border: "1px solid var(--primary-green)",
          };
        default:
          return baseStyles;
      }
    };

    const getSizeStyles = (): React.CSSProperties => {
      switch (size) {
        case "sm":
          return {
            padding: "0.25rem 0.5rem",
            fontSize: "0.75rem",
          };
        case "md":
          return {
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
          };
        case "lg":
          return {
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
          };
        default:
          return {};
      }
    };

    const buttonStyles: React.CSSProperties = {
      ...getVariantStyles(),
      ...getSizeStyles(),
      width: fullWidth ? "100%" : "auto",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontFamily: "var(--font-mono)",
      fontWeight: 500,
      border: "none",
      ...style,
    };

    return (
      <button
        ref={ref}
        className={className}
        style={buttonStyles}
        disabled={disabled || loading}
        {...props}
      >
        {Icon && iconPosition === "left" && (
          <Icon className="w-4 h-4 flex-shrink-0" />
        )}
        {loading ? "Loading..." : children}
        {Icon && iconPosition === "right" && (
          <Icon className="w-4 h-4 flex-shrink-0" />
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
