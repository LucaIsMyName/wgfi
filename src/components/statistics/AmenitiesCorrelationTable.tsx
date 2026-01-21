import { useMemo } from "react";
import { calculateAmenitiesCorrelation, type AmenityCorrelation } from "../../utils/statistics";
import type { Park } from "../../types/park";

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
    <div className="overflow-x-auto">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr
              className="border-b-2"
              style={{ borderColor: "var(--primary-green)" }}>
              <th
                className="text-left py-3 px-2 font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                AUSSTATTUNG 1
              </th>
              <th
                className="text-left py-3 px-2 font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                AUSSTATTUNG 2
              </th>
              <th
                className="text-right py-3 px-2 font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                GEMEINSAM
              </th>
              <th
                className="text-right py-3 px-2 font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                PROZENTSATZ
              </th>
            </tr>
          </thead>
          <tbody>
            {correlations.map((correlation, index) => (
              <tr
                key={`${correlation.amenity1}-${correlation.amenity2}-${index}`}
                className="border-b hover:bg-opacity-50"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: index % 2 === 0 ? "transparent" : "var(--light-sage)",
                }}>
                <td
                  className="py-3 px-2 font-mono text-sm"
                  style={{ color: "var(--deep-charcoal)" }}>
                  {correlation.amenity1}
                </td>
                <td
                  className="py-3 px-2 font-mono text-sm"
                  style={{ color: "var(--deep-charcoal)" }}>
                  {correlation.amenity2}
                </td>
                <td
                  className="text-right py-3 px-2 font-mono text-sm"
                  style={{ color: "var(--deep-charcoal)" }}>
                  {correlation.count}
                </td>
                <td
                  className="text-right py-3 px-2 font-mono text-sm italic"
                  style={{ color: "var(--primary-green)" }}>
                  {correlation.percentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {correlations.map((correlation, index) => (
          <div
            key={`${correlation.amenity1}-${correlation.amenity2}-${index}`}
            className="p-4 border"
            style={{
              backgroundColor: "var(--light-sage)",
              borderColor: "var(--border-color)",
            }}>
            <div className="mb-2">
              <p
                className="font-mono text-xs mb-1"
                style={{ color: "var(--primary-green)" }}>
                AUSSTATTUNGEN
              </p>
              <p
                className="font-mono text-sm"
                style={{ color: "var(--deep-charcoal)" }}>
                {correlation.amenity1} + {correlation.amenity2}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <span
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                GEMEINSAM
              </span>
              <span
                className="font-mono text-sm"
                style={{ color: "var(--deep-charcoal)" }}>
                {correlation.count} Parks
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span
                className="font-mono text-xs"
                style={{ color: "var(--primary-green)" }}>
                PROZENTSATZ
              </span>
              <span
                className="font-mono text-sm italic"
                style={{ color: "var(--primary-green)" }}>
                {correlation.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
