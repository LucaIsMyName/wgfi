import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Database } from "lucide-react";
import { useAccordionState } from "../hooks/useAccordionState";
import type { Park } from "../types/park";
import { Link } from "react-router-dom";

interface MetadataAccordionProps {
  park: Park;
}

const MetadataAccordion = ({ park }: MetadataAccordionProps) => {
  const [value, setValue] = useAccordionState([]);

  if (!park.rawMetadata) {
    return (
      <div style={{ outline: "1px solid var(--border-color)" }} className="p-3">
        <Accordion.Root type="multiple" value={value} onValueChange={setValue}>
          <Accordion.Item value="rawData">
            <Accordion.Header>
              <Accordion.Trigger
                className="w-full flex items-center justify-between font-mono text-xs group"
                style={{ color: "var(--primary-green)" }}
              >
                <span className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5" />
                  Rohdaten
                </span>
                <ChevronDown
                  className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="pt-2">
                <p
                  className="font-serif italic text-sm"
                  style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}
                >
                  Keine Rohdaten verfügbar. Dieser Park wurde manuell
                  hinzugefügt. <Link className="underline" to="/idea">Mehr Informationen</Link>
                </p>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>
      </div>
    );
  }

  const formatFieldName = (key: string): string => {
    return key.replace(/_/g, " ");
  };

  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (typeof value === "object") {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const allFields = Object.entries(park.rawMetadata)
    .filter(([key]) => key !== "geometry" && key !== "type")
    .map(([key, value]) => ({ key, value }));

  return (
    <div style={{ outline: "1px solid var(--border-color)" }} className="p-3">
      <Accordion.Root type="multiple" value={value} onValueChange={setValue}>
        <Accordion.Item value="rawData">
          <Accordion.Header>
            <Accordion.Trigger
              className="w-full flex items-center justify-between font-mono text-xs group"
              style={{ color: "var(--primary-green)" }}
            >
              <span className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5" />
                Rohdaten
              </span>
              <ChevronDown
                className="w-4 h-4 transition-transform duration-200 group-data-[state=open]:rotate-180"
                aria-hidden
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
            <div className="pt-2">
              {/* Data Source Info */}
              <div
                className="mb-3 pb-3"
                style={{ borderBottom: "1px solid var(--border-color)" }}
              >
                <p
                  className="font-mono text-xs mb-1"
                  style={{ color: "var(--deep-charcoal)", opacity: 0.7 }}
                >
                  Dataset: ogdwien:PARKINFOOGD
                </p>
                <a
                  href="https://www.data.gv.at/katalog/dataset/22add642-d849-48ff-9913-8c7ba2d99b46"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs hover:underline"
                  style={{ color: "var(--primary-green)" }}
                >
                  Stadt Wien - Open Data Portal ↗
                </a>
              </div>

              {/* Metadata Table */}
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table
                  className="w-full"
                  style={{ borderCollapse: "collapse" }}
                >
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid var(--border-color)" }}
                    >
                      <th
                        className="font-mono text-xs py-2 px-2 text-left"
                        style={{
                          color: "var(--primary-green)",
                          backgroundColor: "var(--light-sage)",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        FELD
                      </th>
                      <th
                        className="font-mono text-xs py-2 px-2 text-left"
                        style={{
                          color: "var(--primary-green)",
                          backgroundColor: "var(--light-sage)",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                        }}
                      >
                        WERT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFields.map(({ key, value }, index) => (
                      <tr
                        key={key}
                        style={{
                          borderBottom:
                            index < allFields.length - 1
                              ? "1px solid var(--border-color)"
                              : "none",
                        }}
                      >
                        <td
                          className="font-mono text-xs py-2 px-2"
                          style={{
                            color: "var(--deep-charcoal)",
                            opacity: 0.7,
                            verticalAlign: "top",
                            width: "40%",
                          }}
                        >
                          {formatFieldName(key)}
                        </td>
                        <td
                          className="font-mono text-xs py-2 px-2"
                          style={{
                            color: "var(--deep-charcoal)",
                            verticalAlign: "top",
                            wordBreak: "break-word",
                          }}
                        >
                          {formatValue(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* License Info */}
              <div
                className="mt-3 pt-3"
                style={{ borderTop: "1px solid var(--border-color)" }}
              >
                <p
                  className="font-mono text-xs"
                  style={{ color: "var(--deep-charcoal)", opacity: 0.6 }}
                >
                  Lizenz: CC BY 4.0
                </p>
              </div>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
};

export default MetadataAccordion;
