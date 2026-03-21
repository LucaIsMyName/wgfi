import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';

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
        <div className="p-6 rounded-lg max-w-md w-full border-2 bg-soft-cream border-border-color">
          <h3 className="text-lg font-mono mb-4 text-primary-green">
            Standort nicht verfügbar
          </h3>
          <p className="mb-6 font-serif italic text-deep-charcoal">
            Wir konnten Ihren Standort nicht ermitteln. Bitte überprüfen Sie Ihre Browsereinstellungen und stellen Sie sicher, dass Sie den Standortzugriff erlaubt haben.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="primary"
              size="md"
            >
              Schließen
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="p-6 rounded-lg max-w-md w-full border-2 bg-soft-cream border-border-color">
        <h3 className="text-lg font-mono mb-4 text-primary-green">
          Standortzugriff erforderlich
        </h3>
        <p className="mb-6 font-serif italic text-deep-charcoal">
          Um die nächstgelegenen Parks zu finden, benötigen wir Zugriff auf deinen Standort.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            onClick={onClose}
            variant="outline"
            size="md"
          >
            Abbrechen
          </Button>
          <Button
            onClick={onRequestLocation}
            variant="primary"
            size="md"
          >
            Standort teilen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
