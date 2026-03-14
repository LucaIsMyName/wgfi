import { Sun, Moon, Monitor, Contrast, Check, Eclipse } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/Button";

const ThemeToggle = ({ className }: { className?: string }) => {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const themes = [
    { value: "auto" as const, label: "System", icon: Eclipse },
    { value: "light" as const, label: "Hell", icon: Sun },
    { value: "light-hc" as const, label: "Kontrast Hell", icon: Sun },
    { value: "dark" as const, label: "Dunkel", icon: Moon },
    { value: "dark-hc" as const, label: "Kontrast Dunkel", icon: Moon },
  ];

  const currentTheme = themes.find((t) => t.value === mode) || themes[0];
  const Icon = currentTheme.icon;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        icon={Icon}
        aria-label="Theme wechseln"
        className="hover:underline font-serif italic"
        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
      >
        Theme
      </Button>

      {isOpen && (
        <div className="fixed lg:absolute bottom-16 lg:bottom-full mb-0 lg:mb-2 left-4 lg:left-0 right-4 lg:right-auto w-auto lg:w-64 border-2 shadow-lg z-50 bg-soft-cream border-border-color">
          <div className="p-2">
            <p className="font-serif italic text-[12px] mb-3 pb-2 border-b text-deep-charcoal border-border-color">
              Farbschema
            </p>
            {themes.map((theme) => {
              const ThemeIcon = theme.icon;
              const isActive = mode === theme.value;

              return (
                <button
                  key={theme.value}
                  onClick={() => {
                    setMode(theme.value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-2 py-1.5 mb-1 transition-opacity duration-200 hover:opacity-70 text-deep-charcoal"
                  style={{
                    backgroundColor: isActive ? "var(--light-sage)" : "transparent",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ThemeIcon className="w-4 h-4" />

                    <div className="flex items-center gap-2">
                      <span className="font-serif text-[12px] flex-1 text-left truncate">
                        {theme.label}
                      </span>
                      {theme.value.includes("hc") && (
                        <Contrast className="w-4 h-4 opacity-30" />
                      )}
                    </div>
                  </div>
                  {isActive && (
                    <span className="font-mono text-[9px] text-primary-green">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
