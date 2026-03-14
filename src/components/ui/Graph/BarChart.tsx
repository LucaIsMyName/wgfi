import React from 'react';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { Bar } from '@visx/shape';
import { scaleBand, scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';

export interface BarChartDataPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarChartDataPoint[];
  width: number;
  height: number;
  orientation?: 'vertical' | 'horizontal';
  margin?: { top: number; right: number; bottom: number; left: number };
  barColor?: string;
  axisColor?: string;
  tooltipEnabled?: boolean;
  onBarClick?: (dataPoint: BarChartDataPoint) => void;
}

const defaultMargin = { top: 20, right: 20, bottom: 40, left: 80 };

export const BarChart: React.FC<BarChartProps> = ({
  data,
  width,
  height,
  orientation = 'vertical',
  margin = defaultMargin,
  barColor = 'var(--primary-green)',
  axisColor = 'var(--deep-charcoal)',
  tooltipEnabled = true,
  onBarClick,
}) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<BarChartDataPoint>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  if (data.length === 0) {
    return (
      <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--deep-charcoal)' }}>
          Keine Daten verfügbar
        </p>
      </div>
    );
  }

  const xScale = scaleBand<string>({
    domain: data.map((d) => d.label),
    range: [0, xMax],
    padding: 0.2,
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...data.map((d) => d.value))],
    range: [yMax, 0],
  });

  const handleMouseOver = (event: React.MouseEvent<SVGRectElement>, dataPoint: BarChartDataPoint) => {
    if (!tooltipEnabled) return;
    const target = event.target as SVGRectElement;
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

  return (
    <>
      <svg ref={containerRef} width={width} height={height}>
        <Group left={margin.left} top={margin.top}>
          {data.map((d) => {
            const barHeight = yMax - (yScale(d.value) ?? 0);
            const barWidth = xScale.bandwidth();
            const barX = xScale(d.label) ?? 0;
            const barY = yScale(d.value) ?? 0;

            return (
              <Bar
                key={`bar-${d.label}`}
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill={barColor}
                onClick={() => onBarClick?.(d)}
                onMouseMove={(event) => handleMouseOver(event, d)}
                onMouseLeave={hideTooltip}
                style={{ cursor: onBarClick ? 'pointer' : 'default' }}
              />
            );
          })}

          <AxisBottom
            top={yMax}
            scale={xScale}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={() => ({
              fill: axisColor,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              textAnchor: 'middle',
            })}
          />

          <AxisLeft
            scale={yScale}
            stroke={axisColor}
            tickStroke={axisColor}
            tickLabelProps={() => ({
              fill: axisColor,
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              textAnchor: 'end',
              dx: '-0.25em',
              dy: '0.25em',
            })}
          />
        </Group>
      </svg>

      {tooltipEnabled && tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div>
            <strong>{tooltipData.label}</strong>
            <div>{tooltipData.value.toLocaleString()}</div>
          </div>
        </TooltipInPortal>
      )}
    </>
  );
};
