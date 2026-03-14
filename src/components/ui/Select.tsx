import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onValueChange, options, placeholder, label, fullWidth = false, className = '', style }, ref) => {
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

    const labelStyles: React.CSSProperties = {
      display: 'block',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      color: 'var(--primary-green)',
      marginBottom: '0.5rem',
    };

    const triggerStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      padding: '0.5rem',
      backgroundColor: 'var(--soft-cream)',
      color: 'var(--deep-charcoal)',
      border: '1px solid var(--border-color)',
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      fontWeight: 400,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.5rem',
      cursor: 'pointer',
      ...style,
    };

    const contentStyles: React.CSSProperties = {
      backgroundColor: 'var(--soft-cream)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
    };

    const itemStyles: React.CSSProperties = {
      padding: '0.5rem 1rem',
      fontFamily: 'var(--font-serif)',
      fontStyle: 'italic',
      color: 'var(--deep-charcoal)',
      cursor: 'pointer',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    };

    return (
      <div className={className} style={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <Label.Root htmlFor={selectId} style={labelStyles}>
            {label}
          </Label.Root>
        )}
        <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
          <SelectPrimitive.Trigger ref={ref} id={selectId} style={triggerStyles}>
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <ChevronDown className="w-4 h-4" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content position="popper" style={contentStyles}>
              <SelectPrimitive.Viewport>
                {options.map((option) => (
                  <SelectPrimitive.Item key={option.value} value={option.value} style={itemStyles}>
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check className="w-4 h-4" style={{ color: 'var(--primary-green)' }} />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    );
  }
);

Select.displayName = 'Select';
