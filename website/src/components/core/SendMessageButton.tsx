import {
  NFT_GATED_CHAT_CONTRACT,
  WILLIE_NET_CONTRACT,
} from "../../app/constants";
import SubmitTransactionButton from "./SubmitTransactionButton";

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
  nft?: Nft;
  onTransactionConfirmed?: (transactionHash: string) => void;
  disabled?: boolean;
}) {
  function validatePrePerformTransasction() {
    if (props.message.length === 0) {
      return "Message cannot be empty";
    }
  }

  if (props.nft) {
    return (
      <SubmitTransactionButton
        className={props.className}
        functionName="sendMessage"
        abi={NFT_GATED_CHAT_CONTRACT.abi}
        to={NFT_GATED_CHAT_CONTRACT.address}
        args={[props.nft.address, props.nft.tokenId, props.message]}
        messages={{ toasts: TOASTS, button: BUTTONS }}
        useDefaultButtonMessageOnSuccess={true}
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
