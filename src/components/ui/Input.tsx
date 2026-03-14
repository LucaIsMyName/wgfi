import React from 'react';
import * as Label from '@radix-ui/react-label';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', style, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      padding: '0.5rem',
      backgroundColor: 'var(--soft-cream)',
      color: 'var(--deep-charcoal)',
      border: error ? '1px solid var(--copper)' : '1px solid var(--border-color)',
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      fontWeight: 400,
      outline: 'none',
      ...style,
    };

    const labelStyles: React.CSSProperties = {
      display: 'block',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      color: 'var(--primary-green)',
      marginBottom: '0.5rem',
    };

    const errorStyles: React.CSSProperties = {
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      color: 'var(--copper)',
      marginTop: '0.25rem',
    };

    return (
      <div className={className} style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <Label.Root htmlFor={inputId} style={labelStyles}>
            {label}
          </Label.Root>
        )}
        <input ref={ref} id={inputId} style={inputStyles} {...props} />
        {error && <p style={errorStyles}>{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
