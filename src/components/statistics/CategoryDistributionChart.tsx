import { useMemo } from "react";
import { Group } from "@visx/group";
import { Pie } from "@visx/shape";
import { scaleOrdinal } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { calculateDistrictAreaDistribution, type DistrictAreaData } from "../../utils/statistics";
import type { Park } from "../../types/park";

interface CategoryDistributionChartProps {
  parks: Park[];
  width: number;
  height: number;
}

interface TooltipData {
  district: number;
  totalArea: number;
  percentage: number;
}

const margin = { top: 20, right: 20, bottom: 20, left: 20 };

export default function CategoryDistributionChart({
  parks,
  width,
  height,
}: CategoryDistributionChartProps) {
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

  // Calculate district area distribution
  const districtData = useMemo(() => {
    return calculateDistrictAreaDistribution(parks);
  }, [parks]);

  if (districtData.length === 0) {
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
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  // Format area for display
  const formatArea = (area: number): string => {
    if (area >= 1e6) return `${(area / 1e6).toFixed(2)} km²`;
    if (area >= 1e4) return `${(area / 1e4).toFixed(2)} ha`;
    return `${area.toFixed(0)} m²`;
  };

  // Color scale - generate colors for all 23 districts
  const getColor = () => {
    const colors = [
      "var(--primary-green)",
      "var(--light-sage)",
      "var(--accent-gold)",
      "#8B9A46",
      "#6B7A36",
      "#9BA856",
      "#7A8A46",
      "#5A6A36",
      "#8A9A56",
      "#6B7A46",
      "#4A5A26",
      "#9BAA66",
      "#7B8A46",
      "#5B6A36",
      "#8B9A56",
      "#6B7A46",
      "#4A5A26",
      "#9BAA66",
      "#7B8A46",
      "#5B6A36",
      "#8B9A56",
      "#6B7A46",
      "#4A5A26",
    ];
    return scaleOrdinal({
      domain: districtData.map((d) => d.district),
      range: colors,
    });
  };

  const colorScale = getColor();

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
    <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
      <svg ref={containerRef} width={width} height={height}>
        <Group left={margin.left + centerX} top={margin.top + centerY}>
          <Pie
            data={districtData}
            pieValue={(d) => d.totalArea}
            outerRadius={radius}
            innerRadius={radius - donutThickness}
            padAngle={0.005}>
            {(pie) => {
              return pie.arcs.map((arc, index) => {
                const { district, totalArea, percentage } = arc.data;
                const [centroidX, centroidY] = pie.path.centroid(arc);
                const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

                return (
                  <g key={`arc-${district}-${index}`}>
                    <path
                      d={pie.path(arc) || ""}
                      fill={colorScale(district)}
                      onMouseMove={(event: React.MouseEvent<SVGPathElement>) => {
                        const svgElement = (event.target as SVGPathElement).ownerSVGElement;
                        if (svgElement) {
                          const coords = localPoint(svgElement, event);
                          if (coords) {
                            showTooltip({
                              tooltipLeft: coords.x,
                              tooltipTop: coords.y,
                              tooltipData: { district, totalArea, percentage },
                            });
                          }
                        }
                      }}
                      onMouseLeave={hideTooltip}
                      style={{ cursor: "pointer" }}
                    />
                    {hasSpaceForLabel && (
                      <text
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fontSize={11}
                        fill={getDeepCharcoal()}
                        textAnchor="middle"
                        pointerEvents="none"
                        fontFamily="Geist Mono, monospace">
                        {percentage > 3 ? `${district}` : ""}
                      </text>
                    )}
                  </g>
                );
              });
            }}
          </Pie>
        </Group>
      </svg>

      {/* Legend - Show top districts by area - positioned below chart */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px",
          justifyContent: "center",
          padding: "0 8px",
        }}>
        {districtData
          .sort((a, b) => b.totalArea - a.totalArea)
          .slice(0, 10)
          .map((d) => (
            <div
              key={d.district}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                fontFamily: "Geist Mono, monospace",
              }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: colorScale(d.district),
                  borderRadius: "2px",
                }}
              />
              <span style={{ color: getDeepCharcoal() }}>
                {d.district}. ({formatArea(d.totalArea)})
              </span>
            </div>
          ))}
      </div>

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
              {tooltipData.district}. Bezirk
            </strong>
            <br />
            <span style={{ color: getDeepCharcoal() }}>
              {formatArea(tooltipData.totalArea)}
            </span>
            <br />
            <span style={{ color: getDeepCharcoal(), opacity: 0.7 }}>
              {tooltipData.percentage.toFixed(1)}% der Gesamtfläche
            </span>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
