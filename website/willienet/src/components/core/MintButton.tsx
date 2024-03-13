import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WILLIE_NET_CONTRACT } from "../../app/constants";
import { Button } from "@/components/ui/button";
import SubmitTransactionButton from "./SubmitTransactionButton";

export default function MintButton() {
  const { data: hash, writeContractAsync, status } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  async function mint() {
    const res = await writeContractAsync({
      address: WILLIE_NET_CONTRACT.address as any,
      abi: WILLIE_NET_CONTRACT.abi,
      functionName: "mintPublic",
      args: [BigInt(1)],
    });
  }

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
