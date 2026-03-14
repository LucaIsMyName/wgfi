import { useMemo } from "react";
import { calculateAmenitiesCorrelation, type AmenityCorrelation } from "../../utils/statistics";
import type { Park } from "../../types/park";
import { Table } from "../ui/Table";

interface AmenitiesCorrelationTableProps {
  parks: Park[];
}

export default function AmenitiesCorrelationTable({ parks }: AmenitiesCorrelationTableProps) {
  const correlations = useMemo(
    () => calculateAmenitiesCorrelation(parks).slice(0, 15),
    [parks]
  );

  if (correlations.length === 0) {
    return (
      <div className="p-6">
        <p
          className="font-serif italic"
          style={{ color: "var(--deep-charcoal)" }}>
          Keine Korrelationsdaten verfügbar
        </p>
      </div>
    );
  }

  return (
    <Table
      columns={[
        {
          key: 'amenity1',
          header: 'AUSSTATTUNG 1',
          accessor: (row) => row.amenity1,
          sortable: true,
          align: 'left',
        },
        {
          key: 'amenity2',
          header: 'AUSSTATTUNG 2',
          accessor: (row) => row.amenity2,
          sortable: true,
          align: 'left',
        },
        {
          key: 'count',
          header: 'GEMEINSAM',
          accessor: (row) => row.count,
          sortable: true,
          align: 'right',
        },
        {
          key: 'percentage',
          header: 'PROZENTSATZ',
          accessor: (row) => (
            <span style={{ fontStyle: 'italic', color: 'var(--primary-green)' }}>
              {row.percentage.toFixed(1)}%
            </span>
          ),
          sortable: true,
          align: 'right',
        },
      ]}
      data={correlations}
      keyExtractor={(row, index) => `${row.amenity1}-${row.amenity2}-${index}`}
      stickyHeader={false}
      striped={true}
      hoverable={true}
      responsive={true}
      mobileCardView={true}
    />
  );
}
