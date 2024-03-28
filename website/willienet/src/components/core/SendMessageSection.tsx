import { chainTimeToMilliseconds } from "@/app/utils";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import SendMessageButton, { Nft } from "./SendMessageButton";
import { Input } from "@/components/ui/input";

export default function SendMessageSection(props: { nft?: Nft }) {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col items-center justify-between w-full">
      <Input
        placeholder="Enter message to send"
        contentEditable
        onChange={(e) => {
          const txt = e.target.value;
          setMessage(txt);
        }}
      />
      <SendMessageButton
        nft={props.nft}
        className="w-full"
        message={message}
        topic="default"
      />
    </div>
  );
}
