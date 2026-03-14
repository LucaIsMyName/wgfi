import React from 'react';
import * as Label from '@radix-ui/react-label';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, inputSize = 'md', className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'px-3.5 py-1.5 text-[0.85rem]',
      md: 'px-4 py-2 text-[0.925rem]',
      lg: 'px-6 py-3 text-base',
    };

    const inputClasses = `
      bg-soft-cream text-deep-charcoal border font-serif italic font-normal outline-none
      ${error ? 'border-copper' : 'border-border-color'}
      ${fullWidth ? 'w-full' : 'w-auto'}
      ${sizeClasses[inputSize]}
      ${className}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={fullWidth ? 'w-full' : 'w-auto'}>
        {label && (
          <Label.Root 
            htmlFor={inputId} 
            className="block font-mono text-xs text-primary-green mb-2"
          >
            {label}
          </Label.Root>
        )}
        <input ref={ref} id={inputId} className={inputClasses} {...props} />
        {error && (
          <p className="font-mono text-xs text-copper mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
