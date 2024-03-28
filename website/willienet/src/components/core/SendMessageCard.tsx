import { chainTimeToMilliseconds } from "@/app/utils";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SendMessageButton from "./SendMessageButton";
import { Input } from "@/components/ui/input";

export default function SendMessageCard() {
  const [message, setMessage] = useState("");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Send</CardTitle>
        <CardDescription>
          Send a message to WillieNet and your message will be stored on-chain
          forever
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          placeholder="Enter message to send"
          contentEditable
          onChange={(e) => {
            const txt = e.target.value;
            setMessage(txt);
          }}
        />
      </CardContent>
      <CardFooter>
        <SendMessageButton message={message} topic="default" />
      </CardFooter>
    </Card>
  );
}
