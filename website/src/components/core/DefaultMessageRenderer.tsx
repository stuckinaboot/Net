import {
  chainIdToChain,
  chainIdToOpenSeaChainString,
  chainTimeToMilliseconds,
  publicClient,
} from "@/app/utils";
import TimeAgo from "react-timeago";
import { AppMessageRendererProps, SanitizedOnchainMessage } from "./types";
import { SHOW_COPY_MESSAGE_LINK_BUTTON } from "@/app/constants";
import CopyMessageLinkButton from "./CopyMessageLinkButton";
import { readContract } from "viem/actions";
import memoize from "memoizee";
import useAsyncEffect from "use-async-effect";
import React, { useState } from "react";

const SHOW_MESSAGE_TIMESTAMP = false;

export default function DefaultMessageRenderer(props: AppMessageRendererProps) {
  const { idx, message } = props;
  // const [finalMessage, setFinalMessage] = useState<React.ReactNode>(
  //   props.message.text
  // );

  // useAsyncEffect(async () => {
  //   const name = await getAppName(props.message.app, props.chainId);
  //   if (name != null) {
  //     setAppName(name);
  //   }
  // }, [props.message.app, props.chainId]);

  // useAsyncEffect(async () => {
  //   const messageText = await transformedMessageForApp(
  //     props.message.app,
  //     props.chainId,
  //     message.text
  //   );
  //   if (messageText != null) {
  //     setFinalMessage(messageText);
  //   }
  // }, [props.message.app, props.chainId, message.text]);

  return (
    <>
      <p className="flex text-left">
        {props.message.appName && `[${props.message.appName}] `}
        {props.message.transformedMessage
          ? props.message.transformedMessage
          : props.message.text}
      </p>
      <p className="flex justify-end">
        {SHOW_MESSAGE_TIMESTAMP && (
          <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} />
        )}
        {SHOW_MESSAGE_TIMESTAMP && " |"}{" "}
        {message.senderEnsName || message.sender} | #{idx}{" "}
        {SHOW_COPY_MESSAGE_LINK_BUTTON && (
          <CopyMessageLinkButton messageIdx={idx} />
        )}
      </p>
    </>
  );
}
