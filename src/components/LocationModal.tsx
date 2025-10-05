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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white p-6 rounded-lg max-w-md w-full">
          <h3 className="text-lg font-medium mb-4">Standort nicht verfügbar</h3>
          <p className="mb-6">
            Wir konnten Ihren Standort nicht ermitteln. Bitte überprüfen Sie Ihre Browsereinstellungen und stellen Sie sicher, dass Sie den Standortzugriff erlaubt haben.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="px-4 py-2 font-mono text-sm"
              style={{
                backgroundColor: 'var(--primary-green)',
                color: 'var(--soft-cream)',
              }}
            >
              Zur Startseite
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-4">Standortzugriff erforderlich</h3>
        <p className="mb-6">
          Um die nächstgelegenen Parks zu finden, benötigen wir Zugriff auf Ihren Standort.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 font-mono text-sm border border-gray-300 rounded"
          >
            Abbrechen
          </button>
          <button
            onClick={onRequestLocation}
            className="px-4 py-2 font-mono text-sm"
            style={{
              backgroundColor: 'var(--primary-green)',
              color: 'var(--soft-cream)',
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
