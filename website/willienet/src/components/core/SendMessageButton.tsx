import { WILLIE_NET_CONTRACT } from "../../app/constants";
import SubmitTransactionButton from "./SubmitTransactionButton";

export default function SendMessageButton(props: {
  tokenId: number;
  message: string;
  topic: string;
}) {
  return (
    <SubmitTransactionButton
      functionName="sendMessage"
      abi={WILLIE_NET_CONTRACT.abi}
      to={WILLIE_NET_CONTRACT.address}
      args={[props.message, props.topic, ""]}
      messages={{
        toasts: {
          title: "Messages",
          success: "Your message has been sent successfully on Willienet",
          error: "Failed to send your message",
        },
        button: {
          default: "Send message",
          pending: "Sending",
          success: "Sent",
        },
      }}
      useDefaultButtonMessageOnSuccess={true}
    />
  );
}
