import content from "../content/datenschutz.md?raw";
import { StaticPage } from "../components/StaticPage";

export default function DatenschutzPage() {
  return (
    <StaticPage
      content={content}
      title="Datenschutz"
      description="Datenschutzerklärung für den Wiener Grünflächen Index"
    />
  );
}
