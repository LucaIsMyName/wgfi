import { useMemo } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { getTopParksBySize } from "../../utils/statistics";
import type { Park } from "../../types/park";

interface TopParksChartProps {
  parks: Park[];
  width: number;
  height: number;
}

interface TooltipData {
  park: Park;
  area: number;
}

const margin = { top: 20, right: 20, bottom: 40, left: 150 };

export default function TopParksChart({ parks, width, height }: TopParksChartProps) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TooltipData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  // Get top 10 parks by size
  const topParks = useMemo(() => getTopParksBySize(parks, 10), [parks]);

  if (topParks.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width, height }}>
        <p
          className="font-serif italic"
          style={{ color: "var(--deep-charcoal)" }}>
          Keine Daten verfügbar
        </p>
      </div>
    );
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Format area for display
  const formatArea = (area: number): string => {
    if (area >= 1e6) return `${(area / 1e6).toFixed(2)} km²`;
    if (area >= 1e4) return `${(area / 1e4).toFixed(2)} ha`;
    return `${area.toFixed(0)} m²`;
  };

  // Scales
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [0, innerWidth],
        domain: [0, Math.max(...topParks.map((p) => p.area))],
        nice: true,
      }),
    [innerWidth, topParks]
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, innerHeight],
        domain: topParks.map((p) => p.name),
        padding: 0.15,
      }),
    [innerHeight, topParks]
  );

  const getPrimaryGreen = () => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-green")
      .trim();
  };

  const getDeepCharcoal = () => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--deep-charcoal")
      .trim();
  };

  const getSoftCream = () => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue("--soft-cream")
      .trim();
  };

  // Use consistent primary green color for all bars
  const getBarColor = () => {
    return "var(--primary-green)";
  };

  // Get text color for bar labels - ensure good contrast on primary-green bars
  // In light mode: bars are dark green, use light text (soft-cream)
  // In dark mode: bars are bright green, use dark text (deep-charcoal which is light in dark mode)
  const getBarTextColor = () => {
    return "var(--soft-cream)";
  };

  return (
    <div style={{ position: "relative" }}>
      <svg ref={containerRef} width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Bars */}
          {topParks.map((park, index) => {
            const barWidth = xScale(park.area);
            const barHeight = yScale.bandwidth();
            const barY = yScale(park.name);

            // Skip if barY is undefined (shouldn't happen, but safety check)
            if (barY === undefined) {
              return null;
            }

            return (
              <g key={park.id}>
                <Bar
                  x={0}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={getBarColor()}
                  rx={4}
                  onMouseMove={(event: React.MouseEvent<SVGRectElement>) => {
                    const svgElement = (event.target as SVGRectElement).ownerSVGElement;
                    if (svgElement) {
                      const coords = localPoint(svgElement, event);
                      if (coords) {
                        showTooltip({
                          tooltipLeft: coords.x,
                          tooltipTop: coords.y,
                          tooltipData: { park, area: park.area },
                        });
                      }
                    }
                  }}
                  onMouseLeave={hideTooltip}
                  style={{ cursor: "pointer" }}
                />
                {/* Area label on bar */}
                {barWidth > 80 && (
                  <text
                    x={barWidth - 8}
                    y={barY + barHeight / 2}
                    dy=".33em"
                    fontSize={10}
                    fill={getBarTextColor()}
                    textAnchor="end"
                    fontFamily="Geist Mono, monospace"
                    style={{ pointerEvents: "none" }}>
                    {formatArea(park.area)}
                  </text>
                )}
              </g>
            );
          })}

          {/* Y-axis (park names) */}
          <AxisLeft
            scale={yScale}
            numTicks={topParks.length}
            tickFormat={(value: string) => {
              // Truncate long names
              return value.length > 25 ? `${value.substring(0, 22)}...` : value;
            }}
            stroke={getDeepCharcoal()}
            tickStroke={getDeepCharcoal()}
            tickLabelProps={() => ({
              fill: getDeepCharcoal(),
              fontSize: 10,
              fontFamily: "Geist Mono, monospace",
              textAnchor: "end",
              dx: -8,
            })}
          />

          {/* X-axis (area) */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke={getDeepCharcoal()}
            tickStroke={getDeepCharcoal()}
            tickFormat={(value) => {
              const numValue = typeof value === 'number' ? value : (value as { valueOf(): number }).valueOf();
              if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(1)}km²`;
              if (numValue >= 1e4) return `${(numValue / 1e4).toFixed(1)}ha`;
              return `${numValue}`;
            }}
            tickLabelProps={() => ({
              fill: getDeepCharcoal(),
              fontSize: 11,
              fontFamily: "Geist Mono, monospace",
              textAnchor: "middle",
            })}
          />
        </Group>
      </svg>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: getSoftCream(),
            border: `1px solid ${getPrimaryGreen()}`,
            borderRadius: "4px",
            padding: "8px 12px",
            fontFamily: "Geist Mono, monospace",
            fontSize: "12px",
          }}>
          <div>
            <strong style={{ color: getPrimaryGreen() }}>{tooltipData.park.name}</strong>
            <br />
            <span style={{ color: getDeepCharcoal() }}>
              {formatArea(tooltipData.area)}
            </span>
            <br />
            <span style={{ color: getDeepCharcoal(), opacity: 0.7 }}>
              {tooltipData.park.district}. Bezirk
            </span>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
