import { useMemo } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { calculateAmenitiesDistribution } from "../../utils/statistics";
import type { Park } from "../../types/park";

interface AmenitiesChartProps {
  parks: Park[];
  width: number;
  height: number;
}

interface TooltipData {
  amenity: string;
  count: number;
}

const margin = { top: 20, right: 20, bottom: 40, left: 80 };

export default function AmenitiesChart({ parks, width, height }: AmenitiesChartProps) {
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

  // Calculate amenities distribution
  const amenitiesData = useMemo(() => {
    const distribution = calculateAmenitiesDistribution(parks);
    return Array.from(distribution.entries())
      .map(([amenity, count]) => ({ amenity, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15); // Top 15 amenities
  }, [parks]);

  if (amenitiesData.length === 0) {
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
      scaleLinear<number>({
        range: [0, innerWidth],
        domain: [0, Math.max(...amenitiesData.map((d) => d.count))],
        nice: true,
      }),
    [innerWidth, amenitiesData]
  );

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, innerHeight],
        domain: amenitiesData.map((d) => d.amenity),
        padding: 0.2,
      }),
    [innerHeight, amenitiesData]
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

  return (
    <div style={{ position: "relative" }}>
      <svg ref={containerRef} width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Bars */}
          {amenitiesData.map((d) => {
            const barWidth = xScale(d.count);
            const barHeight = yScale.bandwidth();
            const barY = yScale(d.amenity);

            return (
              <Bar
                key={d.amenity}
                x={0}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="var(--primary-green)"
                rx={4}
                onMouseMove={(event: React.MouseEvent<SVGRectElement>) => {
                  const svgElement = (event.target as SVGRectElement).ownerSVGElement;
                  if (svgElement) {
                    const coords = localPoint(svgElement, event);
                    if (coords) {
                      showTooltip({
                        tooltipLeft: coords.x,
                        tooltipTop: coords.y,
                        tooltipData: d,
                      });
                    }
                  }
                }}
                onMouseLeave={hideTooltip}
                style={{ cursor: "pointer" }}
              />
            );
          })}

          {/* Y-axis (amenity names) */}
          <AxisLeft
            scale={yScale}
            tickFormat={(value: string) => value}
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

          {/* X-axis (count) */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke={getDeepCharcoal()}
            tickStroke={getDeepCharcoal()}
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
            <strong style={{ color: getPrimaryGreen() }}>{tooltipData.amenity}</strong>
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
