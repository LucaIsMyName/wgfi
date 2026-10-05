export function buildDistrictSelectOptions(districts: number[]) {
  return [
    { value: "all", label: "Alle Bezirke" },
    ...[...districts].sort((a, b) => a - b).map((district) => ({
      value: String(district),
      label: `${district}. Bezirk`,
    })),
  ];
}
