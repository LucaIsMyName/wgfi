import { useVirtualizer } from '@tanstack/react-virtual';
import { useScrollRestoration } from "../../hooks/useScrollRestoration";
import ParkCard from "./ParkCard";
import type { Park } from "../../types/park";

interface ParksListProps {
  parks: Park[];
  onToggleFavorite: (parkId: string) => void;
  isHighContrast: boolean;
}

/**
 * ParksList component - renders a virtualized list of park cards
 */
export default function ParksList({ parks, onToggleFavorite, isHighContrast }: ParksListProps) {
  // Use scroll restoration instead of just parentRef
  const scrollRestorationRef = useScrollRestoration();
  const parentRef = scrollRestorationRef; // Use the same ref

  const rowVirtualizer = useVirtualizer({
    count: parks.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => {
      return 180;
    }, // Estimate ~180px per park item
    overscan: 8, // Render 8 extra items above/below viewport for smooth scrolling
  });

  if (parks.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-serif italic text-xl text-deep-charcoal font-normal">
          Keine Parks gefunden, die Ihren Kriterien entsprechen.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className="p-4 pt-6 lg:pt-6 h-full"
      style={{
        overflow: 'auto',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none', /* IE and Edge */
      }}>
      {/* Hide scrollbar for WebKit browsers */}
      <style>{`
        div[class*="p-4"]::-webkit-scrollbar,
        div[class*="lg:p-0"]::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const park = parks[virtualRow.index];
          return (
            <div
              key={park.id}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}>
              <ParkCard
                park={park}
                onToggleFavorite={onToggleFavorite}
                isHighContrast={isHighContrast}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
