import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { WILLIE_NET_CONTRACT } from "../../app/constants";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export default function SendMessageButton(props: {
  tokenId: number;
  message: string;
  topic: string;
}) {
  const { toast } = useToast();

  const { data: hash, writeContractAsync, status } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!receipt.isSuccess) {
      return;
    }
    toast({
      title: "Message",
      description: "Your message has been sent successfully on Willienet",
    });
  }, [receipt.isSuccess]);

  async function performTransaction() {
    await writeContractAsync({
      address: WILLIE_NET_CONTRACT.address as any,
      abi: WILLIE_NET_CONTRACT.abi,
      functionName: "sendMessage",
      args: [
        BigInt(props.tokenId),
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        props.message,
        props.topic,
      ],
    });
  }

  return (
    <>
      <Button onClick={performTransaction}>Send message</Button>
      <p>tx submission: {status}</p>
      <p>
        tx receipt: {receipt.status} {hash}
      </p>
    </>
  );
}
