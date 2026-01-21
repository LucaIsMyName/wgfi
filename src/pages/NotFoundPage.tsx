import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <div className="p-6 pt-12 max-w-4xl mx-auto">
      <Helmet>
        <title>Seite nicht gefunden | Wiener Grünflächen Index</title>
      </Helmet>
      
      <h1 className="text-6xl font-normal italic mb-6" style={{ color: 'var(--primary-green)' }}>
        404
      </h1>
      
      <h2 className="text-2xl mb-6" style={{ color: 'var(--deep-charcoal)' }}>
        Seite nicht gefunden
      </h2>
      
      <p className="mb-8 text-lg" style={{ color: 'var(--deep-charcoal)' }}>
        Die von Ihnen gesuchte Seite konnte nicht gefunden werden. Sie wurde möglicherweise verschoben oder existiert nicht mehr.
      </p>
      
      <div className="mt-12">
        <Link 
          to="/" 
          className="inline-block px-8 py-4 font-mono text-sm"
          style={{
            backgroundColor: 'var(--primary-green)',
            color: 'var(--soft-cream)',
          }}
        >
          ZURÜCK ZUR STARTSEITE
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
