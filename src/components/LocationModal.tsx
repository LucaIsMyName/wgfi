import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestLocation: () => void;
  isError: boolean;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onRequestLocation,
  isError,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  if (isError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
        <div
          className="p-6 rounded-lg max-w-md w-full border-2"
          style={{
            backgroundColor: 'var(--soft-cream)',
            borderColor: 'var(--border-color)',
          }}>
          <h3
            className="text-lg font-mono font-medium mb-4"
            style={{ color: 'var(--primary-green)' }}>
            Standort nicht verfügbar
          </h3>
          <p
            className="mb-6 font-serif  italic"
            style={{ color: 'var(--deep-charcoal)' }}>
            Wir konnten Ihren Standort nicht ermitteln. Bitte überprüfen Sie Ihre Browsereinstellungen und stellen Sie sicher, dass Sie den Standortzugriff erlaubt haben.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                onClose();
              }}
              className="px-4 py-2 font-mono text-sm border-2 transition-colors"
              style={{
                backgroundColor: 'var(--primary-green)',
                color: 'var(--soft-cream)',
                borderColor: 'var(--primary-green)',
              }}
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div
        className="p-6 rounded-lg max-w-md w-full border-2"
        style={{
          backgroundColor: 'var(--soft-cream)',
          borderColor: 'var(--border-color)',
        }}>
        <h3
          className="text-lg font-mono font-medium mb-4"
          style={{ color: 'var(--primary-green)' }}>
          Standortzugriff erforderlich
        </h3>
        <p
          className="mb-6 font-serif italic"
          style={{ color: 'var(--deep-charcoal)' }}>
          Um die nächstgelegenen Parks zu finden, benötigen wir Zugriff auf Ihren Standort.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-sm border-2 transition-colors"
            style={{
              borderColor: 'var(--border-color)',
              color: 'var(--deep-charcoal)',
              backgroundColor: 'transparent',
            }}
          >
            Abbrechen
          </button>
          <button
            onClick={onRequestLocation}
            className="px-4 py-2 font-mono text-sm border-2 transition-colors"
            style={{
              backgroundColor: 'var(--primary-green)',
              color: 'var(--soft-cream)',
              borderColor: 'var(--primary-green)',
            }}
          >
            Standort teilen
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
