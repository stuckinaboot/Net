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
import { useEffect, useState } from "react";
import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIBED_DROPS_COLLECTION_URL,
} from "../constants";
import { MintConfig } from "./InscribeDropMintConfigEntry";
import { InscribeDropDialogContents } from "./InscribeDropDialogContents";
import { useRouter } from "next/navigation";
import { fromHex, parseEther, parseUnits } from "viem";
import { useChainId } from "wagmi";
import { chainIdToOpenSeaChainString } from "@/app/utils";
import {
  InscriptionContents,
  MediaFiles,
} from "../../inscriptions/page/InscriptionEntry";
import { generateInscriptionContentsAfterUploadingMedia } from "../../inscriptions/utils";

const TOASTS = {
  title: "Inscribed Drops",
  success: "Your drop has been successfully inscribed on Net",
  error: "Failed to inscribe",
};

const BUTTONS = {
  default: "Inscribe drop",
  pending: "Inscribing",
  success: "Inscribed drop",
};

export default function InscribeDropButton(props: {
  inscription: InscriptionContents;
  mintConfig: MintConfig;
  mediaFiles: MediaFiles;
  disabled?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inscription, setInscription] = useState(props.inscription);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const router = useRouter();
  const chainId = useChainId();

  useEffect(() => {
    setInscription(props.inscription);
  }, [props.inscription]);

  const chainString = chainIdToOpenSeaChainString(chainId);

  const inscriptionJson = inscription;

  function isValidInscription(json: any) {
    return json?.image?.length > 0;
  }
  const validInscription = isValidInscription(inscriptionJson);

  const sanitizedMintConfig = {
    priceInEth: props.mintConfig.priceInEth || 0,
    maxSupply: props.mintConfig.maxSupply || 0,
    mintEndTimestamp: props.mintConfig.mintEndTimestamp || 0,
    maxMintsPerWallet: props.mintConfig.maxMintsPerWallet || 0,
  };

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
          Inscribe drop
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogDescription>
            {uploadingMedia ? (
              "Uploading media to IPFS..."
            ) : (
              <InscribeDropDialogContents
                inscriptionContents={inscription}
                mintConfig={props.mintConfig}
              />
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex">
          <DialogClose asChild>
            <Button className="flex-1 mr-2">Cancel</Button>
          </DialogClose>
          {validInscription && !uploadingMedia && (
            <SubmitTransactionButton
              className="flex-1"
              functionName="inscribe"
              abi={INSCRIBED_DROPS_CONTRACT.abi}
              to={INSCRIBED_DROPS_CONTRACT.address}
              args={[
                parseEther(sanitizedMintConfig.priceInEth.toString()),
                sanitizedMintConfig.maxSupply,
                sanitizedMintConfig.mintEndTimestamp,
                sanitizedMintConfig.maxMintsPerWallet,
                JSON.stringify(inscription),
              ]}
              messages={{
                toasts: {
                  ...TOASTS,
                  success: (
                    <>
                      {TOASTS.success}
                      <Button
                        onClick={() =>
                          window.open(INSCRIBED_DROPS_COLLECTION_URL, "_blank")
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
              onTransactionConfirmed={async (hash, logs) => {
                setDialogOpen(false);
                // TODO filter by address and event topic hash instead of always assuming log 1
                const eventLog = logs[1];
                const tokenId = fromHex(eventLog.data, "number");
                // Push to mint page for token id
                router.push(
                  `/app/inscribed-drops/mint/${chainString}/${tokenId}`
                );
              }}
              prePerformTransactionValidation={() => {
                if (
                  props.mintConfig.mintEndTimestamp &&
                  props.mintConfig.mintEndTimestamp > 0 &&
                  props.mintConfig.mintEndTimestamp <
                    new Date().getTime() / 1000
                ) {
                  // TODO consider moving this error to show on the dialog itself
                  // rather than after hitting inscribe
                  return "Mint end time must be after current time";
                }
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
