import React from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

export interface AccordionItemData {
  value: string;
  trigger: React.ReactNode;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItemData[];
  type?: 'single' | 'multiple';
  defaultValue?: string | string[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, type = 'single', defaultValue, value, onValueChange, className = '' }, ref) => {
    const rootProps = type === 'single' 
      ? {
          type: 'single' as const,
          defaultValue: defaultValue as string | undefined,
          value: value as string | undefined,
          onValueChange: onValueChange as ((value: string) => void) | undefined,
          collapsible: true,
        }
      : {
          type: 'multiple' as const,
          defaultValue: defaultValue as string[] | undefined,
          value: value as string[] | undefined,
          onValueChange: onValueChange as ((value: string[]) => void) | undefined,
        };

    return (
      <AccordionPrimitive.Root
        ref={ref}
        className={className}
        {...rootProps}
      >
        {items.map((item) => (
          <AccordionPrimitive.Item key={item.value} value={item.value}>
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="group w-full flex items-center justify-between font-mono text-xs text-primary-green bg-transparent border-none cursor-pointer py-2">
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.trigger}
                </span>
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionPrimitive.Content
              className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
            >
              <div className="pt-2">{item.content}</div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    );
  }
);

Accordion.displayName = 'Accordion';
