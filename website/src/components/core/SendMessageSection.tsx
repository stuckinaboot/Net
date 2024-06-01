import React, { useState } from "react";
import SendMessageButton from "./SendMessageButton";
import { Textarea } from "@/components/ui/textarea";
import { NetAppContext } from "./types";

export default function SendMessageSection(props: {
  appContext?: NetAppContext;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col items-center justify-between w-full">
      <Textarea
        placeholder="Enter message to send..."
        contentEditable
        onChange={(e) => {
          const txt = e.target.value;
          setMessage(txt);
        }}
        value={message}
        disabled={props.disabled}
      />
      <div className="m-1" />
      <SendMessageButton
        appContext={props.appContext}
        className="w-full"
        message={message}
        topic="default"
        onTransactionConfirmed={() => {
          setMessage("");
        }}
        disabled={props.disabled}
      />
    </div>
  );
}
