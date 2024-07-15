import { useChainId, useWalletClient } from "wagmi";
import { WILLIE_NET_CONTRACT } from "../../app/constants";
import SubmitTransactionButton from "./SubmitTransactionButton";
import { APP_TO_CONFIG, INFERRED_APP_TO_CONFIG } from "./net-apps/AppManager";
import { NetAppContext } from "./types";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { useState } from "react";

const TOASTS = {
  title: "Messages",
  success: "Your message has been sent successfully on Net",
  error: "Failed to send your message",
};

const BUTTONS = {
  default: "Send message",
  pending: "Sending",
  success: "Sent",
};

export default function SendMessageButton(props: {
  message: string;
  topic: string;
  className?: string;
  onTransactionConfirmed?: (transactionHash: string) => void;
  disabled?: boolean;
  appContext?: NetAppContext;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const chainId = useChainId();
  const { data: wallet } = useWalletClient();
  const { toast } = useToast();

  function validatePrePerformTransasction() {
    if (props.message.length === 0) {
      return "Message cannot be empty";
    }
  }
  if (props.appContext == null) {
    // Attempt to infer app context based on the message, where
    // we search for first inferred app matching the
    const inferredAppEntry = Object.entries(INFERRED_APP_TO_CONFIG).find(
      ([_, config]) => {
        if (!config.supportedChains.has(chainId)) {
          // Chain not supported
          return false;
        }

        // Return true if app config can infer app based on this message
        return config.infer(props.message, chainId);
      }
    );
    if (inferredAppEntry != null) {
      const [appAddress, config] = inferredAppEntry;
      const DialogContents = config.dialogContents;
      // TODO support passing back a custom submit transaction button
      // on click function that could replace the submit transaction button
      const transactionParameters =
        config.transactionExecutor.parameters &&
        config.transactionExecutor.parameters(props.message);
      const transactionExecutor = config.transactionExecutor.customExecutor;
      return (
        <Dialog
          open={dialogOpen}
          onOpenChange={(newOpen) => setDialogOpen(newOpen)}
        >
          <DialogTrigger asChild>
            <Button className={props.className}>Send message</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogDescription>
                <DialogContents message={props.message} chainId={chainId} />
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex">
              <DialogClose asChild>
                <Button
                  className="flex-1 mr-2"
                  onClick={() => {
                    setDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <SubmitTransactionButton
                className={cn(props.className, "flex-1")}
                functionName={transactionParameters?.functionName ?? ""}
                abi={transactionParameters?.abi ?? ""}
                to={appAddress}
                args={transactionParameters?.args ?? []}
                messages={{ toasts: TOASTS, button: BUTTONS }}
                useDefaultButtonMessageOnSuccess={true}
                onTransactionConfirmed={(hash) => {
                  // Submit transaction toast doesn't seem to show so
                  // manually display a total on transaction confirmed callback
                  // using the inferred app's config
                  toast({
                    title: TOASTS.title,
                    description: config.toasts.success.description,
                  });
                  setDialogOpen(false);
                  props.onTransactionConfirmed &&
                    props.onTransactionConfirmed(hash);
                }}
                prePerformTransactionValidation={validatePrePerformTransasction}
                disabled={props.disabled}
                customExecutor={
                  transactionExecutor != null && wallet != null
                    ? async () => {
                        return transactionExecutor({
                          message: props.message,
                          wallet,
                        });
                      }
                    : undefined
                }
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
  }

  if (
    props.appContext &&
    APP_TO_CONFIG[props.appContext.appAddress]?.getContractWriteArgsFunction !=
      null
  ) {
    const writeArgs = APP_TO_CONFIG[
      props.appContext.appAddress
    ].getContractWriteArgsFunction({
      appConfig: props.appContext,
      messageText: props.message,
    });
    const sendMessageArgs = writeArgs?.sendMessage;
    return (
      <SubmitTransactionButton
        className={props.className}
        functionName={sendMessageArgs.functionName}
        abi={sendMessageArgs.abi}
        to={sendMessageArgs.to}
        args={sendMessageArgs.args}
        messages={{ toasts: TOASTS, button: BUTTONS }}
        useDefaultButtonMessageOnSuccess={true}
        // TODO allow for custom logic to be executed before send message (ex. sanitizing message, displaying UI)
        // and post confirmation
        onTransactionConfirmed={props.onTransactionConfirmed}
        prePerformTransactionValidation={validatePrePerformTransasction}
        disabled={props.disabled}
      />
    );
  }

  return (
    <SubmitTransactionButton
      className={props.className}
      functionName="sendMessage"
      abi={WILLIE_NET_CONTRACT.abi}
      to={WILLIE_NET_CONTRACT.address}
      args={[props.message, props.topic, ""]}
      messages={{ toasts: TOASTS, button: BUTTONS }}
      useDefaultButtonMessageOnSuccess={true}
      onTransactionConfirmed={props.onTransactionConfirmed}
      prePerformTransactionValidation={validatePrePerformTransasction}
      disabled={props.disabled}
    />
  );
}
