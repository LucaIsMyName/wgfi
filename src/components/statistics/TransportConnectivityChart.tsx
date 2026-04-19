import { useMemo } from "react";
import { Group } from "@visx/group";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Bar } from "@visx/shape";
import type { Park } from "@/types/park";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import ResponsiveContainer from "@/components/statistics/ResponsiveContainer";
import type { TransportConnectivityStats } from "@/utils/advancedStatistics";

interface TransportConnectivityChartProps {
  data: TransportConnectivityStats[];
  width: number;
  height: number;
  metric: "connectivityPercentage" | "avgTransportOptions";
}

const TransportConnectivityChart: React.FC<TransportConnectivityChartProps> = ({
  data,
  width,
  height,
  metric,
}) => {
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Tooltip setup
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    showTooltip,
    hideTooltip,
    tooltipOpen,
  } = useTooltip<TransportConnectivityStats>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  // Color scale
  const getColor = (value: number) => {
    const maxValue = Math.max(
      ...data.map((d) => {
        switch (metric) {
          case "connectivityPercentage":
            return d.connectivityPercentage;
          case "avgTransportOptions":
            return d.avgTransportOptions;
          default:
            return 0;
        }
      })
    );
    
    const intensity = value / maxValue;
    return `rgba(45, 74, 62, ${0.3 + intensity * 0.7})`;
  };

  // Format value for display
  const formatValue = (value: number) => {
    switch (metric) {
      case "connectivityPercentage":
        return `${value.toFixed(1)}%`;
      case "avgTransportOptions":
        return `${value.toFixed(1)}`;
      default:
        return value.toFixed(2);
    }
  };

  // Get metric label
  const getMetricLabel = () => {
    switch (metric) {
      case "connectivityPercentage":
        return "ÖV-Anbindung (%)";
      case "avgTransportOptions":
        return "Durchschnittliche Optionen";
      default:
        return "";
    }
  };

  return (
    <div className="w-full" ref={containerRef}>
      <ResponsiveContainer>
        {(dimensions) => {
          const chartWidth = dimensions.width - margin.left - margin.right;
          const chartHeight = dimensions.height - margin.top - margin.bottom;
          
          // Update scales based on container dimensions
          const xScale = scaleBand<number>({
            range: [0, chartWidth],
            round: true,
            domain: data.map((d) => d.district),
            padding: 0.2,
          });

          const yScale = scaleLinear<number>({
            range: [chartHeight, 0],
            round: true,
            domain: [
              0,
              Math.max(
                ...data.map((d) => {
                  switch (metric) {
                    case "connectivityPercentage":
                      return d.connectivityPercentage;
                    case "avgTransportOptions":
                      return d.avgTransportOptions;
                    default:
                      return 0;
                  }
                })
              ) * 1.1,
            ],
          });

          return (
            <svg width={dimensions.width} height={dimensions.height}>
              <Group left={margin.left} top={margin.top}>
                {/* Grid lines */}
                {yScale.ticks(5).map((tick) => (
                  <g key={`grid-${tick}`}>
                    <line
                      x1={0}
                      y1={yScale(tick)}
                      x2={chartWidth}
                      y2={yScale(tick)}
                      stroke="#e0e0d5"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                    />
                  </g>
                ))}
                
                <AxisBottom
                  top={chartHeight}
                  scale={xScale}
                  stroke="#2c2c2c"
                  tickStroke="#2c2c2c"
                  tickFormat={(value) => String(value)}
                  tickLabelProps={() => ({
                    fill: "#2c2c2c",
                    fontSize: 11,
                    fontFamily: "Geist Mono, monospace",
                    textAnchor: "middle",
                  })}
                />
                
                <AxisLeft
                  scale={yScale}
                  stroke="#2c2c2c"
                  tickStroke="#2c2c2c"
                  tickLabelProps={{
                    fill: "#2c2c2c",
                    fontSize: 12,
                    textAnchor: "end",
                    dx: "-0.25em",
                    dy: "0.25em",
                  }}
                  labelProps={{
                    fill: "#2c2c2c",
                    fontSize: 14,
                    textAnchor: "middle",
                    angle: -90,
                  }}
                  label={getMetricLabel()}
                />

                {data.map((d) => {
                  const value = (() => {
                    switch (metric) {
                      case "connectivityPercentage":
                        return d.connectivityPercentage;
                      case "avgTransportOptions":
                        return d.avgTransportOptions;
                      default:
                        return 0;
                    }
                  })();

                  const barX = xScale(d.district) || 0;
                  const barY = yScale(value);
                  const barWidth = xScale.bandwidth();
                  const barHeight = chartHeight - barY;

                  return (
                    <Bar
                      key={`${d.district}-${metric}`}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill={getColor(value)}
                      rx={2}
                      onMouseMove={(event: React.MouseEvent<SVGRectElement>) => {
                        const point = localPoint(event) || { x: 0, y: 0 };
                        showTooltip({
                          tooltipData: d,
                          tooltipLeft: point.x,
                          tooltipTop: point.y,
                        });
                      }}
                      onMouseLeave={() => hideTooltip()}
                    />
                  );
                })}
              </Group>
            </svg>
          );
        }}
      </ResponsiveContainer>

      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            backgroundColor: "#fcfaf6",
            border: "1px solid #2d4a3e",
            color: "#2c2c2c",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
            {tooltipData.district}. Bezirk
          </div>
          <div>
            {getMetricLabel()}: {formatValue(
              (() => {
                switch (metric) {
                  case "connectivityPercentage":
                    return tooltipData.connectivityPercentage;
                  case "avgTransportOptions":
                    return tooltipData.avgTransportOptions;
                  default:
                    return 0;
                }
              })()
            )}
          </div>
          <div style={{ fontSize: "11px", opacity: 0.7 }}>
            {tooltipData.parksWithTransport} von {tooltipData.totalParks} Parks mit ÖV
          </div>
          {tooltipData.transportTypes.length > 0 && (
            <div style={{ fontSize: "10px", opacity: 0.6, marginTop: "2px" }}>
              Top: {tooltipData.transportTypes[0].type} ({tooltipData.transportTypes[0].count})
            </div>
          )}
        </TooltipInPortal>
      )}
    </div>
  );
};

export default TransportConnectivityChart;
