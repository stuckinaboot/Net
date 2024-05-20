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
  INSCRIBED_DROPS_COLLECTION_URL,
  INSCRIBE_DROP_INSCRIBE_TOPIC,
} from "../constants";
import { MintConfig } from "./InscribeDropMintConfigEntry";
import { InscribeDropDialogContents } from "./InscribeDropDialogContents";
import { useRouter } from "next/router";
import { readContract } from "viem/actions";
import { publicClient } from "@/app/utils";
import { WILLIE_NET_CONTRACT } from "@/app/constants";
import { useAccount } from "wagmi";

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
  inscription: string;
  mintConfig: MintConfig;
  disabled?: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  let inscriptionJson;
  try {
    inscriptionJson = JSON.parse(props.inscription);
  } catch (e) {}

  function isValidInscription(json: any) {
    return json?.name?.length > 0 && json?.image?.length > 0;
  }
  const validInscription = isValidInscription(inscriptionJson);

  const sanitizedMintConfig = {
    priceInEth: props.mintConfig.priceInEth || 0,
    maxSupply: props.mintConfig.maxSupply || 0,
    mintEndTimestamp: props.mintConfig.mintEndTimestamp || 0,
  };

  // TODO look at return value

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
            <InscribeDropDialogContents
              message={props.inscription}
              mintConfig={props.mintConfig}
            />
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
              args={[
                sanitizedMintConfig.priceInEth,
                sanitizedMintConfig.maxSupply,
                sanitizedMintConfig.mintEndTimestamp,
                props.inscription,
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
              onTransactionConfirmed={async () => {
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
