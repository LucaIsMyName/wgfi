import content from "../content/impressum.md?raw";
import { StaticPage } from "../components/StaticPage";

export default function ImpressumPage() {
  return (
    <StaticPage
      content={content}
      title="Impressum"
      description="Impressum des Wiener Grünflächen Index"
    />
  );
}
