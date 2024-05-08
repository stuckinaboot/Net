import { chainTimeToMilliseconds } from "@/app/utils";
import TimeAgo from "react-timeago";
import { SanitizedOnchainMessage } from "./types";
import { SHOW_COPY_MESSAGE_LINK_BUTTON } from "@/app/constants";
import CopyMessageLinkButton from "./CopyMessageLinkButton";

export default function DefaultMessageRenderer(props: {
  idx: number;
  message: SanitizedOnchainMessage;
}) {
  const { idx, message } = props;

  return (
    <>
      <p className="flex text-left">{message.text}</p>
      <p className="flex justify-end">
        <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} /> |{" "}
        {message.sender} | Message #{idx}{" "}
        {SHOW_COPY_MESSAGE_LINK_BUTTON && (
          <CopyMessageLinkButton messageIdx={idx} />
        )}
      </p>
    </>
  );
}
