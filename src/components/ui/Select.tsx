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
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onValueChange, options, placeholder, label, fullWidth = false, size = 'md', className = '' }, ref) => {
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

    const sizeClasses = {
      sm: 'px-3.5 py-1.5 text-[0.85rem]',
      md: 'px-4 py-2 text-[0.925rem]',
      lg: 'px-6 py-3 text-base',
    };

    const triggerClasses = `
      inline-flex items-center justify-between gap-2 bg-soft-cream text-deep-charcoal 
      border border-border-color font-serif italic font-normal cursor-pointer
      ${fullWidth ? 'w-full' : 'w-auto'}
      ${sizeClasses[size]}
    `.trim().replace(/\s+/g, ' ');

    return (
      <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
        {label && (
          <Label.Root 
            htmlFor={selectId} 
            className="block font-mono text-xs text-primary-green mb-2"
          >
            {label}
          </Label.Root>
        )}
        <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
          <SelectPrimitive.Trigger ref={ref} id={selectId} className={triggerClasses}>
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <ChevronDown className="w-4 h-4" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>

          <SelectPrimitive.Portal>
            <SelectPrimitive.Content 
              position="popper" 
              className="bg-soft-cream border border-border-color shadow-lg z-[1000]"
              sideOffset={4}
              collisionPadding={16}
            >
              <SelectPrimitive.Viewport className="w-[var(--radix-select-trigger-width)]">
                {options.map((option) => (
                  <SelectPrimitive.Item 
                    key={option.value} 
                    value={option.value} 
                    className="px-4 py-2 font-serif italic text-deep-charcoal cursor-pointer outline-none flex items-center justify-between hover:bg-light-sage data-[highlighted]:bg-light-sage"
                  >
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator>
                      <Check className="w-4 h-4 text-primary-green" />
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
