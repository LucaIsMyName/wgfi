import React from 'react';
import { ParentSize } from '@visx/responsive';

export interface ResponsiveWrapperProps {
  children: (size: { width: number; height: number }) => React.ReactNode;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  height = 400,
  className = '',
  style,
}) => {
  return (
    <div className={className} style={{ width: '100%', height, ...style }}>
      <ParentSize>
        {({ width, height }) => children({ width, height })}
      </ParentSize>
    </div>
  );
};
