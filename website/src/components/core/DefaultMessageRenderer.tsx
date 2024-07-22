import { chainTimeToMilliseconds } from "@/app/utils";
import TimeAgo from "react-timeago";
import { AppMessageRendererProps } from "./types";
import { SHOW_COPY_MESSAGE_LINK_BUTTON } from "@/app/constants";
import CopyMessageLinkButton from "./CopyMessageLinkButton";
import React from "react";

const SHOW_MESSAGE_TIMESTAMP = false;

export default function DefaultMessageRenderer(props: AppMessageRendererProps) {
  const { idx, message } = props;

  return (
    <div>
      <p className="flex text-left flex-wrap">
        <p>{props.message.appName && `[${props.message.appName}] `}</p>
        <p>
          {props.message.transformedMessage
            ? props.message.transformedMessage
            : props.message.text}
        </p>
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
    </div>
  );
}
