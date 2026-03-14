import React from 'react';
import { Group } from '@visx/group';
import { Pie } from '@visx/shape';
import { scaleOrdinal } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

export interface PieChartDataPoint {
  label: string;
  value: number;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  width: number;
  height: number;
  donut?: boolean;
  innerRadius?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  colorScheme?: string[];
  tooltipEnabled?: boolean;
  onSliceClick?: (dataPoint: PieChartDataPoint) => void;
}

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };
const defaultColorScheme = [
  'var(--primary-green)',
  'var(--secondary-green)',
  'var(--accent-gold)',
  'var(--warm-gold)',
  'var(--copper)',
];

export const PieChart: React.FC<PieChartProps> = ({
  data,
  width,
  height,
  donut = false,
  innerRadius: customInnerRadius,
  margin = defaultMargin,
  colorScheme = defaultColorScheme,
  tooltipEnabled = true,
  onSliceClick,
}) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<PieChartDataPoint>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  if (data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--deep-charcoal)' }}>
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
  const innerRadius = customInnerRadius ?? (donut ? radius * 0.6 : 0);

  const colorScale = scaleOrdinal({
    domain: data.map((d) => d.label),
    range: colorScheme,
  });

  const handleMouseOver = (event: React.MouseEvent<SVGPathElement>, dataPoint: PieChartDataPoint) => {
    if (!tooltipEnabled) return;
    const target = event.target as SVGPathElement;
    const coords = localPoint(target.ownerSVGElement!, event);
    showTooltip({
      tooltipData: dataPoint,
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
    });
  };

  const tooltipStyles: React.CSSProperties = {
    ...defaultStyles,
    backgroundColor: 'var(--soft-cream)',
    color: 'var(--deep-charcoal)',
    border: '1px solid var(--primary-green)',
    padding: '0.5rem',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
  };

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <>
      <svg ref={containerRef} width={width} height={height}>
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <Pie
            data={data}
            pieValue={(d) => d.value}
            outerRadius={radius}
            innerRadius={innerRadius}
            cornerRadius={3}
            padAngle={0.02}
          >
            {(pie) => {
              return pie.arcs.map((arc, index) => {
                const [centroidX, centroidY] = pie.path.centroid(arc);
                const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
                const arcPath = pie.path(arc) || '';
                const arcFill = colorScale(arc.data.label);

                return (
                  <g key={`arc-${arc.data.label}-${index}`}>
                    <path
                      d={arcPath}
                      fill={arcFill}
                      onClick={() => onSliceClick?.(arc.data)}
                      onMouseMove={(event) => handleMouseOver(event, arc.data)}
                      onMouseLeave={hideTooltip}
                      style={{ cursor: onSliceClick ? 'pointer' : 'default' }}
                    />
                    {hasSpaceForLabel && (
                      <text
                        x={centroidX}
                        y={centroidY}
                        dy=".33em"
                        fill="var(--soft-cream)"
                        fontSize={12}
                        fontFamily="var(--font-mono)"
                        textAnchor="middle"
                        pointerEvents="none"
                      >
                        {arc.data.label}
                      </text>
                    )}
                  </g>
                );
              });
            }}
          </Pie>
        </Group>
      </svg>

      {tooltipEnabled && tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <strong>{tooltipData.label}</strong>
            <div>{tooltipData.value.toLocaleString()}</div>
            <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
              {((tooltipData.value / total) * 100).toFixed(1)}%
            </div>
          </div>
        </TooltipInPortal>
      )}
    </>
  );
};
