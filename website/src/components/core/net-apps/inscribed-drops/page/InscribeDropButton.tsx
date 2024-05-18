import SubmitTransactionButton from "@/components/core/SubmitTransactionButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIPTIONS_COLLECTION_URL,
} from "../constants";

const TOASTS = {
  title: "Inscriptions",
  success: "Your art has been successfully inscribed on Net",
  error: "Failed to inscribe",
};

const BUTTONS = {
  default: "Inscribe",
  pending: "Inscribing",
  success: "Inscribed",
};

export default function InscribeDropButton(props: {
  inscription: string;
  disabled?: boolean;
}) {
  const DialogContents = config.dialogContents;
  const [dialogOpen, setDialogOpen] = useState(false);

  let inscriptionJson;
  try {
    inscriptionJson = JSON.parse(props.inscription);
  } catch (e) {}

  function isValidInscription(json: any) {
    return json?.name?.length > 0 && json?.image?.length > 0;
  }
  const validInscription = isValidInscription(inscriptionJson);

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(updatedOpen) => setDialogOpen(updatedOpen)}
    >
      <DialogTrigger asChild>
        <Button className="w-full">Inscribe</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription>
            {<DialogContents message={props.inscription} />}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex">
          <DialogClose asChild>
            <Button className="flex-1 mr-2">Cancel</Button>
          </DialogClose>
          {validInscription && (
            <SubmitTransactionButton
              className="flex-1"
              functionName="inscribe"
              abi={INSCRIBED_DROPS_CONTRACT.abi}
              to={INSCRIBED_DROPS_CONTRACT.address}
              args={[props.inscription]}
              messages={{
                toasts: {
                  ...TOASTS,
                  success: (
                    <>
                      {TOASTS.success}
                      <Button
                        onClick={() =>
                          window.open(INSCRIPTIONS_COLLECTION_URL, "_blank")
                        }
                      >
                        View on OpenSea
                      </Button>
                    </>
                  ),
                },
                button: BUTTONS,
              }}
              useDefaultButtonMessageOnSuccess={true}
              onTransactionConfirmed={() => {
                setDialogOpen(false);
              }}
              prePerformTransasctionValidation={() => {
                // TODO check if message is valid
                return undefined;
              }}
              disabled={props.disabled}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
