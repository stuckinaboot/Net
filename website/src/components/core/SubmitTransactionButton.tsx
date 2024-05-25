import {
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { getDisplayableErrorMessageFromSubmitTransactionError } from "@/app/utils";
import { Log } from "viem";

const SHOW_TX_SUBMISSION_TEXT = false;
const SHOW_TX_RECEIPT_TEXT = false;

export default function SubmitTransactionButton(props: {
  functionName: string;
  args: any[];
  abi: any;
  to: string;
  messages: {
    toasts: { title: string; success: string | React.ReactNode; error: string };
    button: { default: string; pending: string; success: string };
  };
  useDefaultButtonMessageOnSuccess?: boolean;
  className?: string;
  onTransactionConfirmed?: (
    transactionHash: string,
    logs: Log<bigint, number, false>[]
  ) => Promise<void> | void;
  preProcessArgs?: (args: any[]) => Promise<any[]>;
  prePerformTransactionValidation?: () => string | undefined;
  disabled?: boolean;
  value?: string;
}) {
  const { toast } = useToast();
  const chainId = useChainId();
  const [shownSuccessToast, setShownSucccessToast] = useState(false);

  const { data: hash, writeContractAsync, status, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    // On chain switch, reset the most recent transaction write results
    reset();
  }, [chainId]);

  useEffect(() => {
    if (hash == null) {
      return;
    }
    setShownSucccessToast(false);
    console.log(`Transactions submitted with hash: ${hash}`);
  }, [hash]);

  useEffect(() => {
    if (!receipt.isSuccess || shownSuccessToast) {
      return;
    }

    toast({
      title: props.messages.toasts.title,
      description: props.messages.toasts.success,
    });
    hash &&
      props.onTransactionConfirmed &&
      props.onTransactionConfirmed(hash, receipt.data.logs);
    setShownSucccessToast(true);
  }, [receipt.isSuccess]);

  async function performTransaction() {
    if (props.prePerformTransactionValidation) {
      const validationError = props.prePerformTransactionValidation();
      if (validationError) {
        toast({
          title: "Error",
          description: validationError,
        });
        return;
      }
    }
    if (status === "pending") {
      // Don't allow pressing the button again if status is pending
      return;
    }

    let args = props.args;
    if (props.preProcessArgs) {
      try {
        args = await props.preProcessArgs(args);
      } catch (e) {
        toast({
          title: "Error",
          // TODO add custom dynamic error
          description: "Failed to process arguments",
        });
      }
    }

    try {
      await writeContractAsync({
        address: props.to as any,
        abi: props.abi,
        functionName: props.functionName,
        args,
        value: props.value != null ? BigInt(props.value) : undefined,
      });
    } catch (e) {
      if (e instanceof Error) {
        toast({
          title: "Error",
          description: getDisplayableErrorMessageFromSubmitTransactionError(e),
        });
      }
    }
  }

  return (
    <>
      <Button
        onClick={performTransaction}
        className={props.className}
        disabled={props.disabled}
      >
        {status === "idle" ||
        status === "error" ||
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
