import { WILLIE_NET_CONTRACT } from "../../app/constants";
import SubmitTransactionButton from "./SubmitTransactionButton";
import { APP_TO_CONFIG } from "./net-apps/AppManager";
import { NetAppContext } from "./types";

export type Nft = { address: string; tokenId: string };

const TOASTS = {
  title: "Messages",
  success: "Your message has been sent successfully on Willienet",
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
  function validatePrePerformTransasction() {
    if (props.message.length === 0) {
      return "Message cannot be empty";
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
        prePerformTransasctionValidation={validatePrePerformTransasction}
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
      prePerformTransasctionValidation={validatePrePerformTransasction}
      disabled={props.disabled}
    />
  );
}
