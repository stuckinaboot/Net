import { chainTimeToMilliseconds } from "@/app/utils";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import SendMessageButton from "./SendMessageButton";
import { Input } from "@/components/ui/input";

export default function SendMessageSection() {
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
      <SendMessageButton className="w-full" message={message} topic="default" />
    </div>
  );
}
