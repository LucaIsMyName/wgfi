import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown, Database, FileDown, FileJson, FileCode } from "lucide-react";
import { useAccordionState } from "../hooks/useAccordionState";
import type { Park } from "../types/park";
import { Link } from "react-router-dom";

interface MetadataAccordionProps {
  park: Park;
}

const MetadataAccordion = ({ park }: MetadataAccordionProps) => {
  const [value, setValue] = useAccordionState([]);

  // Smart formatting for different value types
  const formatValue = (value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "—";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  // Flatten park object for table display
  const getAllFields = () => {
    const fields: Array<{ key: string; value: any }> = [];
    const excludeKeys = ['isFavorite'];
    
    Object.entries(park).forEach(([key, value]) => {
      if (!excludeKeys.includes(key)) {
        fields.push({ key, value });
      }
    });
    
    return fields;
  };

  const allFields = getAllFields();

  // Sanitize filename
  const sanitizeFilename = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Download helper
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export as CSV
  const exportAsCSV = (e: React.MouseEvent) => {
    e.stopPropagation();
    const csvRows = ['Feld,Wert'];
    allFields.forEach(({ key, value }) => {
      const formattedValue = formatValue(value).replace(/"/g, '""');
      csvRows.push(`"${key}","${formattedValue}"`);
    });
    const csv = csvRows.join('\n');
    const filename = `${sanitizeFilename(park.name)}.csv`;
    downloadFile(csv, filename, 'text/csv;charset=utf-8;');
  };

  // Export as JSON
  const exportAsJSON = (e: React.MouseEvent) => {
    e.stopPropagation();
    const json = JSON.stringify(park, null, 2);
    const filename = `${sanitizeFilename(park.name)}.json`;
    downloadFile(json, filename, 'application/json');
  };

  // Export as standalone HTML
  const exportAsHTML = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const staticMapUrl = `https://staticmap.openstreetmap.de/staticmap.php?center=${park.coordinates.lat},${park.coordinates.lng}&zoom=15&size=800x400&markers=${park.coordinates.lat},${park.coordinates.lng},red`;
    
    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${park.name} - Wiener Grünflächen Index</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      @page { 
        size: A4;
        margin: 2cm;
      }
      body { 
        font-size: 10pt;
        color: #000;
      }
      .no-print { 
        display: none !important;
      }
      table { 
        page-break-inside: avoid;
      }
      h1, h2, h3 { 
        page-break-after: avoid;
      }
      img { 
        max-width: 100%;
        page-break-inside: avoid;
      }
      .print-break-before {
        page-break-before: always;
      }
    }
    body {
      font-family: 'Georgia', serif;
    }
  </style>
</head>
<body class="bg-gray-50 p-8">
  <div class="max-w-4xl mx-auto bg-white shadow-lg p-8">
    <!-- Header -->
    <header class="mb-8 pb-6 border-b-2 border-gray-300">
      <h1 class="text-4xl font-bold text-green-800 mb-2">${park.name}</h1>
      <p class="text-lg text-gray-700">${park.address}</p>
      <p class="text-sm text-gray-600">${park.district}. Bezirk, Wien</p>
    </header>

    <!-- Park Information -->
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-green-700 mb-4">Informationen</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm font-semibold text-gray-600">Fläche</p>
          <p class="text-lg">${park.area.toLocaleString()} m²</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-600">Kategorie</p>
          <p class="text-lg">${park.category || '—'}</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-600">Öffnungszeiten</p>
          <p class="text-lg">${park.openingHours || '—'}</p>
        </div>
        <div>
          <p class="text-sm font-semibold text-gray-600">Barrierefreiheit</p>
          <p class="text-lg">${park.accessibility || '—'}</p>
        </div>
      </div>
      ${park.description ? `
      <div class="mt-4">
        <p class="text-sm font-semibold text-gray-600">Beschreibung</p>
        <p class="text-base leading-relaxed">${park.description}</p>
      </div>
      ` : ''}
    </section>

    <!-- Map -->
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-green-700 mb-4">Lage & Karte</h2>
      <img src="${staticMapUrl}" alt="Karte von ${park.name}" class="w-full border border-gray-300" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
      <div style="display:none;" class="p-4 bg-gray-100 border border-gray-300">
        <p class="text-sm">Koordinaten: ${park.coordinates.lat.toFixed(6)}, ${park.coordinates.lng.toFixed(6)}</p>
      </div>
    </section>

    <!-- Amenities -->
    ${park.amenities && park.amenities.length > 0 ? `
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-green-700 mb-4">Ausstattung</h2>
      <div class="flex flex-wrap gap-2">
        ${park.amenities.map(amenity => `<span class="px-3 py-1 bg-green-100 text-green-800 text-sm rounded">${amenity}</span>`).join('')}
      </div>
    </section>
    ` : ''}

    <!-- Public Transport -->
    ${park.publicTransport && park.publicTransport.length > 0 ? `
    <section class="mb-8">
      <h2 class="text-2xl font-bold text-green-700 mb-4">Öffentliche Verkehrsmittel</h2>
      <ul class="list-disc list-inside">
        ${park.publicTransport.map(transport => `<li>${transport}</li>`).join('')}
      </ul>
    </section>
    ` : ''}

    <!-- Complete Data Table -->
    <section class="mb-8 print-break-before">
      <h2 class="text-2xl font-bold text-green-700 mb-4">Vollständige Daten</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse border border-gray-300">
          <thead>
            <tr class="bg-green-100">
              <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Feld</th>
              <th class="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Wert</th>
            </tr>
          </thead>
          <tbody>
            ${allFields.map(({ key, value }) => `
            <tr>
              <td class="border border-gray-300 px-4 py-2 text-sm font-mono align-top">${key}</td>
              <td class="border border-gray-300 px-4 py-2 text-sm break-words align-top">${formatValue(value).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Footer -->
    <footer class="mt-8 pt-6 border-t-2 border-gray-300 text-sm text-gray-600">
      <p><strong>Quelle:</strong> Stadt Wien - Open Data Portal</p>
      <p><strong>Dataset:</strong> ogdwien:PARKINFOOGD</p>
      <p><strong>Lizenz:</strong> Creative Commons Namensnennung 4.0 International (CC BY 4.0)</p>
      <p><strong>Generiert:</strong> ${new Date().toLocaleString('de-AT')}</p>
      <p class="mt-2"><strong>Wiener Grünflächen Index</strong> - Eine Übersicht aller Parks & Grünflächen der Stadt Wien</p>
    </footer>
  </div>
</body>
</html>`;
    
    const filename = `${sanitizeFilename(park.name)}.html`;
    downloadFile(html, filename, 'text/html');
  };

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
                  <button
                    onClick={exportAsJSON}
                    className="ml-2 hover:opacity-70"
                    title="Als JSON exportieren"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={exportAsCSV}
                    className="hover:opacity-70"
                    title="Als CSV exportieren"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={exportAsHTML}
                    className="hover:opacity-70"
                    title="Als HTML exportieren"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
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
                <button
                  onClick={exportAsJSON}
                  className="ml-2 hover:opacity-70"
                  title="Als JSON exportieren"
                >
                  <FileJson className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={exportAsCSV}
                  className="hover:opacity-70"
                  title="Als CSV exportieren"
                >
                  <FileDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={exportAsHTML}
                  className="hover:opacity-70"
                  title="Als HTML exportieren"
                >
                  <FileCode className="w-3.5 h-3.5" />
                </button>
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

              {/* Complete Park Data Table */}
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
                          {key}
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
