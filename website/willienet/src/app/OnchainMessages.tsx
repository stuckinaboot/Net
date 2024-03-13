import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { WILLIE_NET_CONTRACT } from "./constants";
import truncateEthAddress from "truncate-eth-address";

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

  return <p className="whitespace-break-spaces">{messagesText}</p>;
}
