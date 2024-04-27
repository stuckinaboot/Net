import { WILLIE_NET_CONTRACT } from "../../app/constants";
import SubmitTransactionButton from "./SubmitTransactionButton";

export default function MintButton() {
  return (
    <SubmitTransactionButton
      functionName="mintPublic"
      abi={WILLIE_NET_CONTRACT.abi}
      to={WILLIE_NET_CONTRACT.address}
      args={[
        // Amount
        BigInt(1),
      ]}
      messages={{
        toasts: {
          title: "Mint",
          success: "You successfully minted a Willienet NFT",
          error: "Failed to mint NFT",
        },
        button: {
          default: "Mint Willienet Sender NFT",
          pending: "Minting",
          success: "Minted",
        },
      }}
      useDefaultButtonMessageOnSuccess={true}
    />
  );
}
