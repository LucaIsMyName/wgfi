import { MapPin, Building, Clock, Train, Accessibility, Navigation, ExternalLink, BookOpen, FileText, Calendar } from "lucide-react";

interface ParkInfoProps {
  park: {
    address?: string;
    district: number;
    openingHours?: string;
    accessibility?: string;
    publicTransport?: string[];
    coordinates: { lat: number; lng: number };
    tips?: string[];
    links?: Array<{ title: string; url: string; type?: "official" | "wiki" | "info" | "event" }>;
  };
  userLocation?: { lat: number; lng: number } | null;
}

const ParkInfo = ({ park, userLocation }: ParkInfoProps) => {
  return (
    <>
      {/* Basic Info */}
      <div className="py-4">
        <h3
          className="font-serif italic text-2xl mb-3 truncate"
          style={{ color: "var(--primary-green)", letterSpacing: "0.02em" }}>
          Informationen
        </h3>
        <div className="space-y-6">
          {/* Address Section */}
          <div>
            <span
              className="font-mono text-xs"
              style={{ color: "var(--primary-green)" }}>
              ADRESSE:
            </span>
            <p
              className="font-serif italic mt-1 flex items-center gap-2"
              style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
              <MapPin className="w-5 h-5 flex-shrink-0" /> {park.address || "Adresse nicht verfügbar"}
            </p>
            <p
              className="font-serif italic mt-1 flex items-center gap-2"
              style={{ color: "var(--deep-charcoal)" }}>
              <Building className="w-5 h-5 flex-shrink-0" /> {park.district}. Bezirk
            </p>
          </div>

          {/* Opening Hours Section */}
          {park.openingHours && (
            <div>
              <span
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                ÖFFNUNGSZEITEN:
              </span>
              <p
                className="font-serif italic mt-1 flex items-start gap-2"
                style={{ color: "var(--deep-charcoal)", fontWeight: "400", marginTop: "0.5em" }}>
                <Clock className="w-5 h-5 flex-shrink-0" /> {park.openingHours}
              </p>
            </div>
          )}

          {/* Accessibility Section */}
          {park.accessibility && (
            <div>
              <span
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                BARRIEREFREIHEIT:
              </span>
              <p
                className="font-serif italic mt-1 flex items-center gap-2"
                style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                <Accessibility className="w-5 h-5 flex-shrink-0" /> {park.accessibility}
              </p>
            </div>
          )}

          {/* Public Transport Section */}
          {park.publicTransport && park.publicTransport.length > 0 && (
            <div>
              <span
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                ÖFFENTLICHE VERKEHRSMITTEL:
              </span>
              <div className="space-y-3 mt-1">
                {park.publicTransport.map((transport: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3">
                    <Train
                      className="w-5 h-5 mt-1 flex-shrink-0"
                      stroke="var(--deep-charcoal)"
                    />
                    <span
                      className="font-serif italic"
                      style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                      {transport}
                    </span>
                  </div>
                ))}
              </div>

              {/* Google Maps Directions Link */}
              <div
                className="mt-4 pt-4 border-t border-opacity-20"
                style={{ borderColor: "var(--border-color)" }}>
                <a
                  href={`https://www.google.com/maps/dir/${userLocation ? `${userLocation.lat},${userLocation.lng}` : ""}/${park.coordinates.lat},${park.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-3 text-center font-mono text-xs flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: "var(--primary-green)",
                    color: "var(--soft-cream)",
                    borderRadius: "6px",
                  }}>
                  <Navigation className="w-5 h-5 flex-shrink-0" />
                  {userLocation ? "Route von meinem Standort" : "Route planen"}
                </a>
              </div>
            </div>
          )}

          {/* Tips Section */}
          {park.tips && park.tips.length > 0 && (
            <div>
              <span
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                INSIDER-TIPPS:
              </span>
              <div className="space-y-2 mt-1">
                {park.tips.map((tip: string, index: number) => (
                  <p
                    key={index}
                    className="font-serif italic"
                    style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                    {tip}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Links Section - Only shown if links are available */}
      {park.links && park.links.length > 0 && (
        <div className="pb-4">
          <div className="space-y-2">
            <h3
              className="font-mono text-xs"
              style={{ color: "var(--primary-green)" }}>
              LINKS:
            </h3>
            <div className="mt-2 flex gap-4 flex-wrap items-center">
              {park.links.map((link, index: number) => {
                // Choose icon based on link type
                let icon = <ExternalLink className="w-4 h-4 flex-shrink-0" />;
                if (link.type === "wiki") icon = <BookOpen className="w-4 h-4 flex-shrink-0" />;
                if (link.type === "official") icon = <FileText className="w-4 h-4 flex-shrink-0" />;
                if (link.type === "event") icon = <Calendar className="w-4 h-4 flex-shrink-0" />;

                return (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-serif hover:underline py-1"
                    style={{ color: "var(--deep-charcoal)", fontWeight: "400" }}>
                    {icon}
                    {link.title}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParkInfo;
