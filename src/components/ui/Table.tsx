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
  style?: React.CSSProperties;
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
  style,
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

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    ...style,
  };

  const headerCellStyles = (align?: 'left' | 'center' | 'right'): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--primary-green)',
    backgroundColor: 'var(--light-sage)',
    padding: '0.75rem 0.5rem',
    textAlign: align || 'left',
    borderBottom: '2px solid var(--primary-green)',
    position: stickyHeader ? 'sticky' : 'relative',
    top: stickyHeader ? 0 : 'auto',
    zIndex: stickyHeader ? 1 : 'auto',
  });

  const bodyCellStyles = (align?: 'left' | 'center' | 'right'): React.CSSProperties => ({
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    color: 'var(--deep-charcoal)',
    padding: '0.75rem 0.5rem',
    textAlign: align || 'left',
    borderBottom: '1px solid var(--border-color)',
    verticalAlign: 'top',
  });

  const rowStyles = (index: number): React.CSSProperties => ({
    backgroundColor: striped && index % 2 === 0 ? 'transparent' : 'var(--light-sage)',
  });

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

  const containerStyles: React.CSSProperties = {
    overflowX: responsive ? 'auto' : 'visible',
  };

  const mobileCardStyles: React.CSSProperties = {
    padding: '1rem',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--light-sage)',
    marginBottom: '1rem',
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className={`${mobileCardView ? 'hidden md:block' : ''} ${className}`} style={containerStyles}>
        <table style={tableStyles}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={headerCellStyles(column.align)}>
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        padding: 0,
                      }}
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
                style={rowStyles(index)}
                className={hoverable ? 'hover:bg-opacity-50' : ''}
              >
                {columns.map((column) => (
                  <td key={column.key} style={bodyCellStyles(column.align)}>
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
            <div key={keyExtractor(row, index)} style={mobileCardStyles}>
              {columns.map((column) => (
                <div key={column.key} style={{ marginBottom: '0.5rem' }}>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--primary-green)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {column.header}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.875rem',
                      color: 'var(--deep-charcoal)',
                    }}
                  >
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
