import { useMemo } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import {
  prepareDistrictChartData,
  type DistrictChartData,
} from "@/utils/statistics";
import { getParkDistrictAreaDistribution } from "@/utils/parkUtils";
import type { Park } from "@/types/park";

interface DistrictComparisonChartProps {
  parks: Park[];
  districtAreas: Record<number, number>;
  width: number;
  height: number;
  metric: "parkCount" | "totalArea" | "coveragePercentage";
}

interface TooltipData {
  district: number;
  parkCount: number;
  totalArea: number;
  coveragePercentage: number;
}

const margin = { top: 20, right: 20, bottom: 60, left: 80 };

export default function DistrictComparisonChart({
  parks,
  districtAreas,
  width,
  height,
  metric,
}: DistrictComparisonChartProps) {
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

  // Prepare district data
  const districtData = useMemo(
    () => prepareDistrictChartData(parks, districtAreas),
    [parks, districtAreas],
  );

  if (districtData.length === 0) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ width, height }}
      >
        <p
          className="font-serif italic"
          style={{ color: "var(--deep-charcoal)" }}
        >
          Keine Daten verfügbar
        </p>
      </div>
    );
  }

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Get the metric value for scaling
  const getMetricValue = (data: DistrictChartData) => {
    switch (metric) {
      case "parkCount":
        return data.parkCount;
      case "totalArea":
        return data.totalArea;
      case "coveragePercentage":
        return data.coveragePercentage;
    }
  };

  // Scales
  const xScale = useMemo(
    () =>
      scaleBand<number>({
        range: [0, innerWidth],
        domain: districtData.map((d) => d.district),
        padding: 0.2,
      }),
    [innerWidth, districtData],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [innerHeight, 0],
        domain: [0, Math.max(...districtData.map((d) => getMetricValue(d)))],
        nice: true,
      }),
    [innerHeight, districtData, metric],
  );

  // Cache CSS variables at component mount to avoid repeated DOM reads
  const cssVars = useMemo(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      primaryGreen: styles.getPropertyValue("--primary-green").trim(),
      deepCharcoal: styles.getPropertyValue("--deep-charcoal").trim(),
      softCream: styles.getPropertyValue("--soft-cream").trim(),
      accentGold: styles.getPropertyValue("--accent-gold").trim(),
    };
  }, []);

  // Use consistent primary green color for all bars
  const getBarColor = () => {
    return cssVars.primaryGreen;
  };

  const formatMetricValue = (value: number) => {
    switch (metric) {
      case "parkCount":
        return `${value} ${value === 1 ? "Park" : "Parks"}`;
      case "totalArea":
        if (value >= 1e6) return `${(value / 1e6).toFixed(2)} km²`;
        if (value >= 1e4) return `${(value / 1e4).toFixed(2)} ha`;
        return `${value.toFixed(0)} m²`;
      case "coveragePercentage":
        return `${value.toFixed(2)}%`;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <svg ref={containerRef} width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {/* Bars */}
          {districtData.map((d) => {
            const barWidth = xScale.bandwidth();
            const barHeight = innerHeight - yScale(getMetricValue(d));
            const barX = xScale(d.district);
            const barY = yScale(getMetricValue(d));

            return (
              <Bar
                key={d.district}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={getBarColor()}
                rx={4}
                onMouseMove={(event: React.MouseEvent<SVGRectElement>) => {
                  const svgElement = (event.target as SVGRectElement)
                    .ownerSVGElement;
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

          {/* Y-axis */}
          <AxisLeft
            scale={yScale}
            stroke={cssVars.deepCharcoal}
            tickStroke={cssVars.deepCharcoal}
            tickFormat={(value: unknown) => {
              const numValue = typeof value === "number" ? value : 
                (typeof value === "object" && value !== null && "valueOf" in value) 
                  ? (value as { valueOf(): number }).valueOf() 
                  : 0;
              if (metric === "totalArea") {
                if (numValue >= 1e6) return `${(numValue / 1e6).toFixed(1)}km²`;
                if (numValue >= 1e4) return `${(numValue / 1e4).toFixed(1)}ha`;
                return `${numValue}`;
              }
              return `${numValue}`;
            }}
            tickLabelProps={() => ({
              fill: cssVars.deepCharcoal,
              fontSize: 11,
              fontFamily: "Geist Mono, monospace",
              textAnchor: "end",
              dx: -8,
            })}
          />

          {/* X-axis (district numbers) */}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke={cssVars.deepCharcoal}
            tickStroke={cssVars.deepCharcoal}
            tickFormat={(value: unknown) => {
              const numValue = typeof value === "number" ? value : 
                (typeof value === "object" && value !== null && "valueOf" in value) 
                  ? (value as { valueOf(): number }).valueOf() 
                  : 0;
              return `${numValue}`;
            }}
            tickLabelProps={() => ({
              fill: cssVars.deepCharcoal,
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
            backgroundColor: cssVars.softCream,
            border: `1px solid ${cssVars.primaryGreen}`,
            borderRadius: "4px",
            padding: "8px 12px",
            fontFamily: "Geist Mono, monospace",
            fontSize: "12px",
          }}
        >
          <div>
            <strong style={{ color: cssVars.primaryGreen }}>
              {tooltipData.district}. Bezirk
            </strong>
            <br />
            <span style={{ color: cssVars.deepCharcoal }}>
              {tooltipData.parkCount}{" "}
              {tooltipData.parkCount === 1 ? "Park" : "Parks"}
            </span>
            <br />
            <span style={{ color: cssVars.deepCharcoal }}>
              {formatMetricValue(getMetricValue(tooltipData))}
            </span>
            <br />
            <span style={{ color: cssVars.deepCharcoal, opacity: 0.7 }}>
              {tooltipData.coveragePercentage.toFixed(2)}% Abdeckung
            </span>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
