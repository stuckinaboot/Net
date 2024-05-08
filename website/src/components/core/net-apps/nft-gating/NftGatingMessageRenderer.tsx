import { chainTimeToMilliseconds } from "@/app/utils";
import TimeAgo from "react-timeago";
import { AppMessageRendererProps } from "../../types";
import { useNftGating } from "./NftGatingProvider";
import { SHOW_COPY_MESSAGE_LINK_BUTTON } from "@/app/constants";
import CopyMessageLinkButton from "../../CopyMessageLinkButton";

export default function NftGatingMessageRenderer(
  props: AppMessageRendererProps
) {
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
