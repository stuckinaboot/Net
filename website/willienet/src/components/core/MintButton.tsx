import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WILLIE_NET_CONTRACT } from "../../app/constants";
import { Button } from "@/components/ui/button";

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
    <>
      <Button onClick={mint}>Mint</Button>
      <p>
        tx submission: {status}
        <br />
      </p>
      <p>
        tx receipt: {receipt.status}, hash: {hash}
      </p>
    </>
  );
}
