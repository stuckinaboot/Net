import { parseEther } from "viem";
import SubmitTransactionButton from "../../SubmitTransactionButton";
import {
  DINOS_CONTRACT,
  DINO_PRICE_IN_ETH,
  MINT_AMOUNTS,
  MINT_TOASTS,
} from "./constants";

export default function HamMintButtons() {
  return (
    <div className="flex space-x-2 flex-wrap">
      {MINT_AMOUNTS.map((amt) => (
        <SubmitTransactionButton
          key={amt}
          functionName="mint"
          args={[amt]}
          abi={DINOS_CONTRACT.abi}
          to={DINOS_CONTRACT.address}
          messages={{
            toasts: {
              ...MINT_TOASTS,
              success:
                "Successfully minted dinos. Refresh the page to view your dinos.",
            },
            button: {
              default: `Mint ${amt}`,
              pending: "Minting Dinos",
              success: "Dinos Minted",
            },
          }}
          value={parseEther((DINO_PRICE_IN_ETH * amt).toString()).toString()}
        />
      ))}
    </div>
  );
}
