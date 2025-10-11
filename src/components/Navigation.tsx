import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Palmtree, Map, Menu, X, Heart, Lightbulb, BarChart3 } from "lucide-react";
import Logo from "./Logo";

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMapPage = location.pathname.startsWith('/map');

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
    { path: "/parks", label: "Index", icon: <Palmtree className="w-5 h-5" /> },
    { path: "/map", label: "Karte", icon: <Map className="w-5 h-5" /> },
    { path: "/statistics", label: "Statistiken", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/favorites", label: "Favoriten", icon: <Heart className="w-5 h-5" /> },
    { path: "/idea", label: "Idee", icon: <Lightbulb className="w-5 h-5" /> },
  ];

  const NavLink = ({ path, label, icon, onClick }: { path: string; label: string; icon: React.ReactNode; onClick?: () => void }) => (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center space-x-3 py-2 font-serif relative transition-opacity duration-200 ${isActive(path) ? "active-nav-item" : ""}`}
      style={{
        color: isActive(path) ? "var(--primary-green)" : "var(--deep-charcoal)",
        opacity: isActive(path) ? 1 : 0.8,
        // borderLeft: isActive(path) ? '3px solid var(--primary-green)' : '3px solid transparent',
        paddingLeft: "1.25rem",
      }}
      onMouseEnter={(e) => {
        if (!isActive(path)) {
          e.currentTarget.style.opacity = "1";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive(path)) {
          e.currentTarget.style.opacity = "0.8";
        }
      }}>
      <span style={{ color: isActive(path) ? "var(--primary-green)" : "var(--deep-charcoal)" }}>{icon}</span>
      <span className="font-regular font-mono text-xs">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50"
        style={{
          width: "clamp(200px, 16vw, 280px)",
          background: "var(--sidebar-bg)",
          borderRight: "1px solid var(--border-color)",
        }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Logo />

          {/* Navigation Items */}
          <div className="flex-1 py-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                {...item}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex flex-wrap gap-4 text-xs">
              <a
                href="https://lucamack.at/impressum.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-mono text-[9px]"
                style={{ color: "var(--primary-green)" }}>
                Impressum
              </a>
              <a
                href="https://lucamack.at/datenschutz.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-mono text-[9px]"
                style={{ color: "var(--primary-green)" }}>
                Datenschutz
              </a>
            </div>
            <p
              className="text-xs italic opacity-50"
              style={{ color: "var(--primary-green)", fontFamily: "EB Garamond, serif" }}>
              Wiener Grünflächen <span className="font-mono font-semibold not-italic text-[0.8em]">index</span>
            </p>
          </div>
        </div>
      </nav>

      {/* Mobile Header - Fixed on scroll */}
      <header
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "shadow-sm" : ""}`}
        style={{
          backgroundColor: "var(--sidebar-bg)",
          borderBottom: "1px solid var(--border-color)",
        }}>
        <div className="flex items-center justify-between py-2 pr-4 transition-all duration-300">
          <Logo />

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 transition-opacity duration-200"
            style={{
              backgroundColor: "var(--light-sage)",
              color: "var(--primary-green)",
              borderRadius: "4px",
              opacity: 0.9,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.9")}>
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="lg:hidden h-20"></div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div
            className="fixed top-0 right-0 h-full w-full transform transition-transform duration-300 ease-in-out"
            style={{
              background: "var(--sidebar-bg)",
              boxShadow: "-2px 0 10px rgba(0, 0, 0, 0.05)",
              borderLeft: "1px solid var(--border-color)",
            }}>
            <div className="flex flex-col h-full">
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-6 border-b"
                style={{ borderColor: "var(--border-color)" }}>
                <span
                  className="font-sans text-xl font-bold"
                  style={{ color: "var(--primary-green)" }}>
                  Menü
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 transition-opacity duration-200"
                  style={{ color: "var(--primary-green)", opacity: 0.8 }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.8")}>
                  <X className="w-5 h-5" />
                </button>
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
              <div
                className="px-4 py-3 border-t"
                style={{ borderColor: "var(--border-color)" }}>
                <div className="flex gap-8 my-4">
                  <a
                    href="https://lucamack.at/impressum.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] hover:underline font-mono"
                    style={{ color: "var(--primary-green)" }}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Impressum
                  </a>
                  <a
                    href="https://lucamack.at/datenschutz.txt"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] hover:underline font-mono"
                    style={{ color: "var(--primary-green)" }}
                    onClick={() => setIsMobileMenuOpen(false)}>
                    Datenschutz
                  </a>
                </div>
                <p
                  className="text-xs italic opacity-50"
                  style={{ color: "var(--primary-green)", fontFamily: "EB Garamond, serif" }}>
                  Wiener Grünflächen <span className="font-mono not-italic text-[0.8em]">index</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
