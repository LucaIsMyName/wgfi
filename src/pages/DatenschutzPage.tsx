import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

export const DatenschutzPage: React.FC = () => {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch("https://lucamack.at/datenschutz.txt");
        const text = await response.text();
        setContent(text);
      } catch (error) {
        console.error("Error fetching datenschutz:", error);
        setContent("Der Datenschutztext konnte nicht geladen werden. Bitte versuchen Sie es später erneut.");
      }
    };

    fetchContent();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "var(--main-bg)" }}>
      <Helmet>
        <title>Datenschutz | Wiener Grünflächen Index</title>
        <meta
          name="description"
          content="Datenschutzerklärung für den Wiener Grünflächen Index"
        />
      </Helmet>
      <div className="max-w-4xl mx-auto">
        <h1 className="font-serif text-3xl mb-6" style={{ color: "var(--primary-green)" }}>
          Datenschutzerklärung
        </h1>
        <div 
          className="prose max-w-none font-serif"
          style={{ color: "var(--deep-charcoal)" }}
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }}
        />
      </div>
    </div>
  );
};

export default DatenschutzPage;
