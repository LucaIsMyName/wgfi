import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Palmtree,
  Map,
  Menu,
  X,
  Heart,
  BookOpen,
  BarChart3,
  Search,
} from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Wordmark from "./Wordmark";
import { Button } from "./ui/Button";

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const isMapPage = location.pathname.startsWith("/map");

  const openCommandPalette = () => {
    const event = new KeyboardEvent("keydown", {
      key: "k",
      metaKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Track scroll position for fixed header
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { path: "/index", label: "Index", icon: <Palmtree className="w-5 h-5" /> },
    { path: "/map", label: "Karte", icon: <Map className="w-5 h-5" /> },
    {
      path: "/statistics",
      label: "Statistiken",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      path: "/favorites",
      label: "Favoriten",
      icon: <Heart className="w-5 h-5" />,
    },
    { path: "/idea", label: "Idee", icon: <BookOpen className="w-5 h-5" /> },
  ];

  const NavLink = ({
    path,
    label,
    icon,
    onClick,
  }: {
    path: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }) => (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center space-x-3 py-2 font-serif relative transition-opacity duration-200 px-4 ${
        isActive(path)
          ? "active-nav-item italic text-primary-green opacity-100"
          : "text-deep-charcoal opacity-80"
      }`}
    >
      <div
        className={isActive(path) ? "text-primary-green" : "text-deep-charcoal"}
      >
        {icon}
      </div>
      <div className="font-serif text-2xl sm:text-xl ">{label}</div>
    </Link>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 z-[1000] bg-sidebar-bg border-r border-border-color"
        style={{
          width: "clamp(200px, 16vw, 280px)",
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Logo />

          {/* Navigation Items */}
          <div className="flex-1 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-4 space-y-3">
            {/* Row 1: Imprint & Privacy */}
            <div className="flex items-center gap-3">
              <a
                href="https://lucamack.at/impressum.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-serif italic text-[12px] text-primary-green"
              >
                Impressum
              </a>
              <a
                href="https://lucamack.at/datenschutz.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-serif italic text-[12px] text-primary-green"
              >
                Datenschutz
              </a>
            </div>
            {/* Row 2: Theme Toggle & Search */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {/* <div className="w-1 h-full !bg-border-color" /> */}
              <Button
                onClick={openCommandPalette}
                variant="ghost"
                size="sm"
                icon={Search}
                className="!p-0 italic"
              >
                Suche
              </Button>
            </div>
            <Wordmark />
          </div>
        </div>
      </nav>

      {/* Mobile Header - Fixed on scroll */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 bg-sidebar-bg border-b border-border-color ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="flex items-center justify-between py-2 pr-4 transition-all duration-300">
          <Logo />

          <Button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            variant="secondary"
            size="sm"
            icon={isMobileMenuOpen ? X : Menu}
            style={{ opacity: 0.9 }}
          />
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-20"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[1000]">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 "
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className="fixed top-0 right-0 h-full w-full transform transition-transform duration-300 ease-in-out bg-sidebar-bg"
            style={{
              boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.05)",
            }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-6 border-b border-border-color">
                <span className="font-sans text-xl font-bold text-primary-green">
                  Menü
                </span>
                <Button
                  onClick={() => setIsMobileMenuOpen(false)}
                  variant="ghost"
                  size="sm"
                  icon={X}
                  style={{ opacity: 0.8 }}
                />
              </div>

              {/* Navigation Items */}
              <div className="flex-1 py-4 space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    {...item}
                    onClick={() => setIsMobileMenuOpen(false)}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 pt-3 pb-8 border-t border-border-color space-y-3">
                {/* Row 1: Imprint & Privacy */}
                <div className="flex items-center gap-3">
                  <a
                    href="https://lucamack.at/impressum.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] hover:underline font-serif italic text-primary-green"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Impressum
                  </a>
                  <a
                    href="https://lucamack.at/datenschutz.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] hover:underline font-serif italic text-primary-green"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Datenschutz
                  </a>
                </div>
                {/* Row 2: Theme Toggle & Search */}
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setTimeout(openCommandPalette, 100);
                    }}
                    variant="ghost"
                    size="sm"
                    icon={Search}
                    style={{ padding: "0.25rem 0.5rem" }}
                  >
                    Suche
                  </Button>
                </div>
                <Wordmark />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
