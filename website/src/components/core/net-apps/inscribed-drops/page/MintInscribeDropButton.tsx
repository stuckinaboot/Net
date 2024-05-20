import SubmitTransactionButton from "@/components/core/SubmitTransactionButton";
import { Button } from "@/components/ui/button";
import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIBED_DROPS_COLLECTION_URL,
} from "../constants";
import { parseUnits } from "viem";

const TOASTS = {
  title: "Inscribed Drops",
  success: "You successfully minted this inscribed drop on Net",
  error: "Failed to mint",
};

const BUTTONS = {
  default: "Mint",
  pending: "Minting",
  success: "Minted",
};

export default function MintInscribeDropButton(props: {
  tokenId: string;
  quantity: number;
  priceInEth: number;
  disabled?: boolean;
}) {
  return (
    <SubmitTransactionButton
      className="flex-1"
      functionName="mint"
      abi={INSCRIBED_DROPS_CONTRACT.abi}
      to={INSCRIBED_DROPS_CONTRACT.address}
      args={[props.tokenId, props.quantity]}
      value={
        props.priceInEth != 0
          ? parseUnits(
              (props.priceInEth * props.quantity).toString(),
              18
            ).toString()
          : undefined
      }
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
      onTransactionConfirmed={() => {}}
      prePerformTransasctionValidation={() => {
        // TODO check if message is valid
        return undefined;
      }}
      disabled={props.disabled}
    />
  );
}
