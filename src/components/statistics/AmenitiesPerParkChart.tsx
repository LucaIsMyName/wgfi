import { useMemo } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { binAmenitiesPerPark, type AmenitiesPerParkBin } from "../../utils/statistics";
import type { Park } from "../../types/park";

interface AmenitiesPerParkChartProps {
  parks: Park[];
  width: number;
  height: number;
}

interface TooltipData {
  range: string;
  count: number;
}

const margin = { top: 20, right: 20, bottom: 60, left: 60 };

export default function AmenitiesPerParkChart({
  parks,
  width,
  height,
}: AmenitiesPerParkChartProps) {
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

  // Calculate bins
  const bins = useMemo(() => binAmenitiesPerPark(parks), [parks]);

  if (bins.length === 0 || bins.every((bin) => bin.count === 0)) {
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

  // Scales
  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, innerWidth],
        domain: bins.map((b) => b.range),
        padding: 0.2,
      }),
    [innerWidth, bins]
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [innerHeight, 0],
        domain: [0, Math.max(...bins.map((b) => b.count))],
        nice: true,
      }),
    [innerHeight, bins]
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

  return (
    <div style={{ position: "relative" }}>
      <svg ref={containerRef} width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Bars */}
          {bins.map((bin) => {
            const barWidth = xScale.bandwidth();
            const barHeight = innerHeight - yScale(bin.count);
            const barX = xScale(bin.range);
            const barY = yScale(bin.count);

            return (
              <g key={bin.range}>
                <Bar
                  x={barX}
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
                          tooltipData: { range: bin.range, count: bin.count },
                        });
                      }
                    }
                  }}
                  onMouseLeave={hideTooltip}
                  style={{ cursor: "pointer" }}
                />
                {/* Count label on bar */}
                {barHeight > 20 && (
                  <text
                    x={(barX || 0) + barWidth / 2}
                    y={barY - 4}
                    fontSize={11}
                    fill={getDeepCharcoal()}
                    textAnchor="middle"
                    fontFamily="Geist Mono, monospace"
                    style={{ pointerEvents: "none" }}>
                    {bin.count}
                  </text>
                )}
              </g>
            );
          })}

          {/* Y-axis (count) */}
          <AxisLeft
            scale={yScale}
            stroke={getDeepCharcoal()}
            tickStroke={getDeepCharcoal()}
            tickLabelProps={() => ({
              fill: getDeepCharcoal(),
              fontSize: 11,
              fontFamily: "Geist Mono, monospace",
              textAnchor: "end",
              dx: -8,
            })}
          />

          {/* X-axis (amenity count ranges) */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke={getDeepCharcoal()}
            tickStroke={getDeepCharcoal()}
            tickFormat={(value: string) => value}
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
            <strong style={{ color: getPrimaryGreen() }}>
              {tooltipData.range} Ausstattungen
            </strong>
            <br />
            <span style={{ color: getDeepCharcoal() }}>
              {tooltipData.count} {tooltipData.count === 1 ? "Park" : "Parks"}
            </span>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
