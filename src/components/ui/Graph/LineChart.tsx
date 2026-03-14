import React from 'react';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinePath } from '@visx/shape';
import { scaleLinear, scalePoint } from '@visx/scale';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { Circle } from '@visx/shape';

export interface LineChartDataPoint {
  label: string;
  value: number;
}

export interface LineChartProps {
  data: LineChartDataPoint[];
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  lineColor?: string;
  axisColor?: string;
  tooltipEnabled?: boolean;
  showPoints?: boolean;
}

const defaultMargin = { top: 20, right: 20, bottom: 40, left: 80 };

export const LineChart: React.FC<LineChartProps> = ({
  data,
  width,
  height,
  margin = defaultMargin,
  lineColor = 'var(--primary-green)',
  axisColor = 'var(--deep-charcoal)',
  tooltipEnabled = true,
  showPoints = true,
}) => {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<LineChartDataPoint>();

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

  const xScale = scalePoint<string>({
    domain: data.map((d) => d.label),
    range: [0, xMax],
    padding: 0.5,
  });

  const yScale = scaleLinear<number>({
    domain: [0, Math.max(...data.map((d) => d.value))],
    range: [yMax, 0],
  });

  const handleMouseOver = (event: React.MouseEvent<SVGCircleElement>, dataPoint: LineChartDataPoint) => {
    if (!tooltipEnabled) return;
    const target = event.target as SVGCircleElement;
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
          <LinePath
            data={data}
            x={(d) => xScale(d.label) ?? 0}
            y={(d) => yScale(d.value) ?? 0}
            stroke={lineColor}
            strokeWidth={2}
          />

          {showPoints &&
            data.map((d) => {
              const cx = xScale(d.label) ?? 0;
              const cy = yScale(d.value) ?? 0;

              return (
                <Circle
                  key={`point-${d.label}`}
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill={lineColor}
                  onMouseMove={(event) => handleMouseOver(event, d)}
                  onMouseLeave={hideTooltip}
                  style={{ cursor: 'pointer' }}
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
