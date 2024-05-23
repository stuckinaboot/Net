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
import { INSCRIPTIONS_CONTRACT, config } from "../InscriptionInferredAppConfig";
import { useState } from "react";
import { INSCRIPTIONS_COLLECTION_URL } from "../constants";
import { InscriptionContents, MediaFiles } from "./InscriptionEntry";
import { uploadToNftStorage } from "@/app/utils";
import { generateInscriptionContentsAfterUploadingMedia } from "../utils";

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

export default function InscribeButton(props: {
  inscription: InscriptionContents;
  mediaFiles: MediaFiles;
  disabled?: boolean;
}) {
  const DialogContents = config.dialogContents;
  const [dialogOpen, setDialogOpen] = useState(false);

  const inscriptionJson = props.inscription;

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
            <DialogContents message={JSON.stringify(props.inscription)} />
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
              abi={INSCRIPTIONS_CONTRACT.abi}
              to={INSCRIPTIONS_CONTRACT.address}
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
              preProcessArgs={async (args) => {
                if (!props.mediaFiles.image && !props.mediaFiles.animation) {
                  return args;
                }
                const inscriptionContents =
                  await generateInscriptionContentsAfterUploadingMedia({
                    mediaFiles: props.mediaFiles,
                    inscriptionContents: JSON.parse(args[0]),
                  });
                return [JSON.stringify(inscriptionContents)];
              }}
              prePerformTransactionValidation={() => {
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
