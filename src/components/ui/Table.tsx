import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface TableColumn<T> {
  key: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  stickyHeader?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  responsive?: boolean;
  mobileCardView?: boolean;
  className?: string;
}

type SortConfig<T> = {
  key: string;
  direction: 'asc' | 'desc';
} | null;

export function Table<T>({
  columns,
  data,
  keyExtractor,
  stickyHeader = false,
  striped = true,
  hoverable = true,
  responsive = true,
  mobileCardView = true,
  className = '',
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column?.sortable) return;

    setSortConfig((current) => {
      if (current?.key === columnKey) {
        if (current.direction === 'asc') {
          return { key: columnKey, direction: 'desc' };
        }
        return null;
      }
      return { key: columnKey, direction: 'asc' };
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const column = columns.find((col) => col.key === sortConfig.key);
      if (!column) return 0;

      const aValue = column.accessor(a);
      const bValue = column.accessor(b);

      if (aValue === bValue) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig, columns]);

  const getSortIcon = (columnKey: string) => {
    if (sortConfig?.key !== columnKey) {
      return <ArrowUpDown className="w-3 h-3 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="w-3 h-3" />
    ) : (
      <ArrowDown className="w-3 h-3" />
    );
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className={`${mobileCardView ? 'hidden md:block' : ''} ${responsive ? 'overflow-x-auto' : ''} ${className}`}>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className={`
                    font-mono text-xs text-primary-green bg-light-sage px-2 py-3 
                    border-b-2 border-primary-green
                    ${stickyHeader ? 'sticky top-0 z-10' : 'relative'}
                    ${getAlignClass(column.align)}
                  `}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 font-mono text-xs text-primary-green"
                    >
                      {column.header}
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <tr
                key={keyExtractor(row, index)}
                className={`
                  ${striped && index % 2 !== 0 ? 'bg-light-sage' : 'bg-transparent'}
                  ${hoverable ? 'hover:bg-light-sage hover:bg-opacity-50' : ''}
                `}
              >
                {columns.map((column) => (
                  <td 
                    key={column.key} 
                    className={`
                      font-mono text-sm text-deep-charcoal px-2 py-3 
                      border-b border-border-color align-top
                      ${getAlignClass(column.align)}
                    `}
                  >
                    {column.accessor(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      {mobileCardView && (
        <div className="block md:hidden">
          {sortedData.map((row, index) => (
            <div 
              key={keyExtractor(row, index)} 
              className="p-4 border border-border-color bg-light-sage mb-4"
            >
              {columns.map((column) => (
                <div key={column.key} className="mb-2">
                  <p className="font-mono text-xs text-primary-green mb-1">
                    {column.header}
                  </p>
                  <p className="font-mono text-sm text-deep-charcoal">
                    {column.accessor(row)}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
