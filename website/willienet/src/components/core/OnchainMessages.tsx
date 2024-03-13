import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { WILLIE_NET_CONTRACT } from "../../app/constants";
import truncateEthAddress from "truncate-eth-address";
import { cn } from "@/lib/utils";
import TimeAgo from "react-timeago";
import { chainTimeToMilliseconds } from "@/app/utils";

type OnchainMessage = {
  extraData: string;
  message: string;
  sender: string;
  senderTokenId: BigInt;
  timestamp: BigInt;
  topic: string;
};

export default function OnchainMessages() {
  const [messagesText, setMessagesText] = useState("");

  const totalMessagesResult = useReadContract({
    abi: WILLIE_NET_CONTRACT.abi,
    address: WILLIE_NET_CONTRACT.address as any,
    functionName: "getTotalMessagesCount",
    query: {
      refetchInterval: 2000,
    },
  });
  const messagesResult = useReadContract({
    abi: WILLIE_NET_CONTRACT.abi,
    address: WILLIE_NET_CONTRACT.address as any,
    functionName: "getMessagesInRange",
    args: [BigInt(0), totalMessagesResult.data],
  });

  useEffect(() => {
    const onchainMessages = messagesResult.data as OnchainMessage[] | undefined;
    if (!onchainMessages) {
      return;
    }
    const sanitizedOnchainMessages = onchainMessages.map((message) =>
      JSON.stringify(
        {
          sender: truncateEthAddress(message.sender),
          message: message.message,
        },
        null,
        4
      )
    );
    setMessagesText(sanitizedOnchainMessages.join("\n"));
  }, [messagesResult.data]);

  const onchainMessages =
    (messagesResult.data as OnchainMessage[] | undefined) || [];
  const sanitizedOnchainMessages = onchainMessages.map((message) => ({
    ...message,
    sender: truncateEthAddress(message.sender),
    timestamp: +message.timestamp.toString(),
    senderTokenId: message.senderTokenId.toString(),
  }));

  return (
    <p
      className={cn(
        "whitespace-break-spaces",
        "font-mono",
        "border-2 border-black",
        "max-h-60 overflow-y-auto",
        "w-full"
      )}
    >
      {sanitizedOnchainMessages.map((message, idx) => (
        <p key={idx}>
          <p className="text-left">{message.message}</p>
          <p className="text-right">
            <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} /> |{" "}
            {message.sender}
          </p>
        </p>
      ))}
    </p>
  );
}
