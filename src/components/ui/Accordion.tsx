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
  style?: React.CSSProperties;
}

export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, type = 'single', defaultValue, value, onValueChange, className = '', style }, ref) => {
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

    const triggerStyles: React.CSSProperties = {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.75rem',
      color: 'var(--primary-green)',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      padding: '0.5rem 0',
    };

    const contentStyles: React.CSSProperties = {
      overflow: 'hidden',
    };

    return (
      <AccordionPrimitive.Root
        ref={ref}
        className={className}
        style={style}
        {...rootProps}
      >
        {items.map((item) => (
          <AccordionPrimitive.Item key={item.value} value={item.value}>
            <AccordionPrimitive.Header>
              <AccordionPrimitive.Trigger className="group" style={triggerStyles}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
              style={contentStyles}
            >
              <div style={{ paddingTop: '0.5rem' }}>{item.content}</div>
            </AccordionPrimitive.Content>
          </AccordionPrimitive.Item>
        ))}
      </AccordionPrimitive.Root>
    );
  }
);

Accordion.displayName = 'Accordion';
