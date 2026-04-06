import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./ui/Button";

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
  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[10000] bg-black/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[10001] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-border-color bg-soft-cream p-6 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-green focus-visible:ring-offset-2">
          {isError ? (
            <>
              <Dialog.Title className="text-lg font-mono mb-4 text-primary-green">
                Standort nicht verfügbar
              </Dialog.Title>
              <Dialog.Description className="mb-6 font-serif italic text-deep-charcoal">
                Wir konnten Ihren Standort nicht ermitteln. Bitte überprüfen Sie
                Ihre Browsereinstellungen und stellen Sie sicher, dass Sie den
                Standortzugriff erlaubt haben.
              </Dialog.Description>
              <div className="flex justify-end">
                <Dialog.Close asChild>
                  <Button variant="primary" size="md">
                    Schließen
                  </Button>
                </Dialog.Close>
              </div>
            </>
          ) : (
            <>
              <Dialog.Title className="text-lg font-mono mb-4 text-primary-green">
                Standortzugriff erforderlich
              </Dialog.Title>
              <Dialog.Description className="mb-6 font-serif italic text-deep-charcoal">
                Um die nächstgelegenen Parks zu finden, benötigen wir Zugriff
                auf deinen Standort.
              </Dialog.Description>
              <div className="flex justify-end gap-3">
                <Dialog.Close asChild>
                  <Button variant="outline" size="md">
                    Abbrechen
                  </Button>
                </Dialog.Close>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onRequestLocation}
                >
                  Standort teilen
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LocationModal;
