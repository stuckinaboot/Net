import {
  chainTimeToMilliseconds,
  getUrlForSpecificMessageIndex,
} from "@/app/utils";
import TimeAgo from "react-timeago";
import { SanitizedOnchainMessage } from "../types";
import { useNftGating } from "./NftGatingProvider";
import { SHOW_COPY_MESSAGE_LINK_BUTTON } from "@/app/constants";
import copy from "copy-to-clipboard";
import { toast } from "@/components/ui/use-toast";
import { CopyIcon } from "@radix-ui/react-icons";
import CopyMessageLinkButton from "../CopyMessageLinkButton";

export default function NftGatingMessageRenderer(props: {
  idx: number;
  message: SanitizedOnchainMessage;
}) {
  const { idx, message } = props;
  const { nftMsgSenderTokenIds, nftMsgSenderImages } = useNftGating();

  return (
    <>
      <p className="flex text-left">{message.text}</p>
      <p className="flex justify-end">
        <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} /> |{" "}
        {nftMsgSenderTokenIds != null ? (
          <>
            Willie #{nftMsgSenderTokenIds[idx].toString()}{" "}
            {/* Making the image too big causes weird scroll issues on message send */}
            {nftMsgSenderImages && (
              <img src={nftMsgSenderImages[idx]} className="inline w-6" />
            )}
          </>
        ) : (
          message.sender
        )}{" "}
        | Message #{idx}{" "}
        {SHOW_COPY_MESSAGE_LINK_BUTTON && (
          <CopyMessageLinkButton messageIdx={idx} />
        )}
      </p>
    </>
  );
}
