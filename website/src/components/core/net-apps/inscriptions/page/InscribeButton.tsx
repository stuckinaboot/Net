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
import { useEffect, useState } from "react";
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
  const [inscription, setInscription] = useState(props.inscription);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  useEffect(() => {
    setInscription(props.inscription);
  }, [props.inscription]);

  const inscriptionJson = props.inscription;

  function isValidInscription(json: any) {
    return json?.image?.length > 0;
  }
  const validInscription = isValidInscription(inscriptionJson);

  async function uploadMedia() {
    if (!props.mediaFiles.image && !props.mediaFiles.animation) {
      return;
    }
    setUploadingMedia(true);
    const updatedInscriptionContents =
      await generateInscriptionContentsAfterUploadingMedia({
        mediaFiles: props.mediaFiles,
        inscriptionContents: inscription,
      });
    setInscription(updatedInscriptionContents);
    setUploadingMedia(false);
  }

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(updatedOpen) => setDialogOpen(updatedOpen)}
    >
      <DialogTrigger asChild>
        <Button
          onClick={async () => {
            await uploadMedia();
          }}
          className="w-full"
        >
          Inscribe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription>
            {uploadingMedia ? (
              "Uploading media to IPFS..."
            ) : (
              <DialogContents message={JSON.stringify(inscription)} />
            )}
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
              args={[JSON.stringify(inscription)]}
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
