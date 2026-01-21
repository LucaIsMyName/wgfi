import { useState, useEffect, useRef, useCallback } from "react";
import type { ReactNode } from "react";

interface ResponsiveContainerProps {
  children: (size: { width: number; height: number }) => ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Temporary responsive container component to replace @visx/responsive's ParentSize
 * until packages are installed. Uses ResizeObserver to track container size.
 */
export default function ResponsiveContainer({
  children,
  className,
  style,
}: ResponsiveContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
  const rafRef = useRef<number | null>(null);
  const dimensionsRef = useRef(dimensions);

  // Update ref when dimensions change
  useEffect(() => {
    dimensionsRef.current = dimensions;
  }, [dimensions]);

  // Debounced update function
  const updateDimensions = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Cancel any pending RAF
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
    }

    // Use requestAnimationFrame to batch updates
    rafRef.current = requestAnimationFrame(() => {
      if (container) {
        const newWidth = container.clientWidth || 400;
        const newHeight = container.clientHeight || 400;
        
        // Only update if dimensions actually changed (prevent infinite loops)
        if (
          dimensionsRef.current.width !== newWidth ||
          dimensionsRef.current.height !== newHeight
        ) {
          setDimensions({ width: newWidth, height: newHeight });
        }
      }
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement with a small delay to ensure container is rendered
    const timeoutId = setTimeout(() => {
      updateDimensions();
    }, 0);

    // Use ResizeObserver if available, otherwise fallback to window resize
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        updateDimensions();
      });
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", updateDimensions);
    }

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateDimensions);
      }
    };
  }, [updateDimensions]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ 
        width: "100%", 
        height: "100%", 
        position: "relative",
        overflow: "hidden",
        ...style 
      }}>
      {children(dimensions)}
    </div>
  );
}
