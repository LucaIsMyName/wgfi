import React, { useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Check, Filter } from 'lucide-react';
import { getAmenityIcon } from '../../utils/amenityIcons';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  value: string[];
  onValueChange: (value: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const MultiSelect = React.forwardRef<HTMLButtonElement, MultiSelectProps>(
  ({ 
    value, 
    onValueChange, 
    options, 
    placeholder = 'Ausstattung wählen...', 
    label, 
    fullWidth = false, 
    size = 'md', 
    className = '' 
  }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

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

    const handleToggle = (optionValue: string) => {
      if (value.includes(optionValue)) {
        onValueChange(value.filter(v => v !== optionValue));
      } else {
        onValueChange([...value, optionValue]);
      }
    };

    const selectedCount = value.length;
    const displayText = selectedCount > 0 
      ? `${selectedCount} ${selectedCount === 1 ? 'Ausstattung' : 'Ausstattungen'}`
      : placeholder;

    return (
      <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
        {label && (
          <div className="block font-mono text-xs text-primary-green mb-2 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            {label}
          </div>
        )}
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenu.Trigger ref={ref} className={triggerClasses}>
            <span className={selectedCount > 0 ? 'text-primary-green font-semibold' : ''}>
              {displayText}
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content 
              className="bg-soft-cream border border-border-color shadow-lg z-[1000] overflow-hidden max-h-[300px] overflow-y-auto"
              sideOffset={4}
              collisionPadding={16}
              style={{ minWidth: 'var(--radix-dropdown-menu-trigger-width)' }}
            >
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                const Icon = getAmenityIcon(option.value);
                
                return (
                  <DropdownMenu.Item 
                    key={option.value} 
                    onSelect={() => handleToggle(option.value)}
                    className="px-4 py-2 font-serif italic text-deep-charcoal cursor-pointer outline-none flex items-center justify-between hover:bg-light-sage data-[highlighted]:bg-light-sage"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-primary-green flex-shrink-0" />
                    )}
                  </DropdownMenu.Item>
                );
              })}
              
              {value.length > 0 && (
                <>
                  <DropdownMenu.Separator className="h-px bg-border-color my-1" />
                  <DropdownMenu.Item 
                    onSelect={() => onValueChange([])}
                    className="px-4 py-2 font-serif italic text-deep-charcoal cursor-pointer outline-none hover:bg-light-sage data-[highlighted]:bg-light-sage text-primary-green"
                  >
                    Alle zurücksetzen
                  </DropdownMenu.Item>
                </>
              )}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    );
  }
);

MultiSelect.displayName = 'MultiSelect';
