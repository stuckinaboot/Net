import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

// TODO implement this helper class and modify MintButton and SendMessageButton to use it

const SHOW_TX_SUBMISSION_TEXT = false;
const SHOW_TX_RECEIPT_TEXT = false;

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
  className?: string;
  onTransactionConfirmed?: (transactionHash: string) => void;
}) {
  const { toast } = useToast();

  const { data: hash, writeContractAsync, status } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (hash == null) {
      return;
    }
    console.log(`Transactions submitted with hash: ${hash}`);
  }, [hash]);

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
    const txnHash = await writeContractAsync({
      address: props.to as any,
      abi: props.abi,
      functionName: props.functionName,
      args: props.args,
    });
    console.log("CALLING");
    props.onTransactionConfirmed && props.onTransactionConfirmed(txnHash);
  }

  return (
    <>
      <Button onClick={performTransaction} className={props.className}>
        {status === "idle" ||
        (receipt.isSuccess && props.useDefaultButtonMessageOnSuccess)
          ? props.messages.button.default
          : receipt.isSuccess
          ? props.messages.button.success
          : receipt.isPending
          ? props.messages.button.pending
          : "TODO figure out else"}
      </Button>
      {SHOW_TX_SUBMISSION_TEXT && <p>tx submission: {status}</p>}
      {SHOW_TX_RECEIPT_TEXT && (
        <p>
          tx receipt: {receipt.status} {hash}
        </p>
      )}
    </>
  );
}
