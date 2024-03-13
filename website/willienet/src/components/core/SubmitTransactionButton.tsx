import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

// TODO implement this helper class and modify MintButton and SendMessageButton to use it

export default function SubmitTransactionButton(props: {
  functionName: string;
  args: any[];
  abi: any;
  to: string;
  messages: {
    toasts: { title: string; success: string; error: string };
    button: { default: string; pending: string; success: string };
  };
  useDefaultButtonMessageOnSuccess?: boolean;
}) {
  const { toast } = useToast();

  const { data: hash, writeContractAsync, status } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (!receipt.isSuccess) {
      return;
    }
    toast({
      title: props.messages.toasts.title,
      description: props.messages.toasts.success,
    });
  }, [receipt.isSuccess]);

  async function performTransaction() {
    await writeContractAsync({
      address: props.to as any,
      abi: props.abi,
      functionName: props.functionName,
      args: props.args,
    });
  }

  return (
    <>
      <Button onClick={performTransaction}>
        {status === "idle"
          ? props.messages.button.default ||
            (receipt.isSuccess && props.useDefaultButtonMessageOnSuccess)
          : receipt.isSuccess
          ? props.messages.button.success
          : receipt.isPending
          ? props.messages.button.pending
          : "TODO figure out default"}
      </Button>
      <p>tx submission: {status}</p>
      <p>
        tx receipt: {receipt.status} {hash}
      </p>
    </>
  );
}
