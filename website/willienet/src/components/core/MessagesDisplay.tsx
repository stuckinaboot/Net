import { NFT_GATED_CHAT_CONTRACT, WILLIE_NET_CONTRACT } from "@/app/constants";
import { chainTimeToMilliseconds, getNftImages } from "@/app/utils";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import TimeAgo from "react-timeago";
import truncateEthAddress from "truncate-eth-address";
import useAsyncEffect from "use-async-effect";
import { isAddress } from "viem";
import { useReadContract } from "wagmi";

type OnchainMessage = {
  extraData: string;
  message: string;
  sender: string;
  app: string;
  timestamp: BigInt;
  topic: string;
};

type SanitizedOnchainMessage = {
  sender: string;
  timestamp: number;
  extraData: string;
  message: string;
  app: string;
  topic: string;
};

export default function MessagesDisplay(props: { nftAddress?: string }) {
  const [nftMsgSenderImages, setNftMsgSenderImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<SanitizedOnchainMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [finishedInitialScrollToBottom, setFinishedInitialScrollToBottom] =
    useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function checkAndUpdateShouldShowScrollToBottomButton() {
    const scrollContainer = scrollContainerRef.current;
    const targetDiv = messagesEndRef.current;
    if (targetDiv == null || scrollContainer == null) {
      return;
    }

    const containerTop = scrollContainer.getBoundingClientRect().top;
    const { top, bottom } = targetDiv.getBoundingClientRect();
    setShowScrollButton(
      top > containerTop && bottom > containerTop + scrollContainer.clientHeight
    );
  }

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    scrollContainer?.addEventListener(
      "scroll",
      checkAndUpdateShouldShowScrollToBottomButton
    );
    return () => {
      scrollContainer?.removeEventListener(
        "scroll",
        checkAndUpdateShouldShowScrollToBottomButton
      );
    };
  }, []);

  const isValidNftAddress = props.nftAddress
    ? isAddress(props.nftAddress)
    : false;

  const totalMessagesReadContractArgs = props.nftAddress
    ? {
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getTotalMessagesForAppTopicCount",
        query: {
          refetchInterval: 2000,
        },
        args: [NFT_GATED_CHAT_CONTRACT.address, props.nftAddress],
      }
    : {
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getTotalMessagesCount",
        query: {
          refetchInterval: 2000,
        },
      };
  const totalMessagesResult = useReadContract(totalMessagesReadContractArgs);
  const messagesResultsReadContractArgs = props.nftAddress
    ? {
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getMessagesInRangeForAppTopic",
        args: [
          BigInt(0),
          totalMessagesResult.data,
          NFT_GATED_CHAT_CONTRACT.address,
          props.nftAddress,
        ],
      }
    : {
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getMessagesInRange",
        args: [BigInt(0), totalMessagesResult.data],
      };
  const messagesResult = useReadContract(messagesResultsReadContractArgs);
  const onchainMessages =
    (messagesResult.data as OnchainMessage[] | undefined) || [];
  const sanitizedOnchainMessages: SanitizedOnchainMessage[] =
    onchainMessages.map((message) => ({
      ...message,
      sender: truncateEthAddress(message.sender),
      timestamp: +message.timestamp.toString(),
    }));
  useEffect(() => {
    if (messagesResult.data == null) {
      return;
    }
    // Updating messages using state and skipping when message result is undefined
    // the flicker of loading messages
    setMessages(sanitizedOnchainMessages);
  }, [sanitizedOnchainMessages.length]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    checkAndUpdateShouldShowScrollToBottomButton();
  }, [messages.length]);

  const nftMsgSendersResult = useReadContract({
    abi: NFT_GATED_CHAT_CONTRACT.abi,
    address: NFT_GATED_CHAT_CONTRACT.address as any,
    functionName: "getMessageSendersInRange",
    args: [props.nftAddress, BigInt(0), totalMessagesResult.data],
  });
  const nftMsgSenderTokenIds = nftMsgSendersResult?.data as
    | BigInt[]
    | undefined;

  useAsyncEffect(async () => {
    if (props.nftAddress == null || nftMsgSenderTokenIds == null) {
      return;
    }
    const images = await getNftImages({
      contractAddress: props.nftAddress,
      tokenIds: nftMsgSenderTokenIds.map((tokenId) => tokenId.toString()),
    });
    setNftMsgSenderImages(images);
  }, [nftMsgSenderTokenIds?.length]);

  useEffect(() => {
    if (
      finishedInitialScrollToBottom ||
      sanitizedOnchainMessages.length === 0
    ) {
      return;
    }
    // Attempt to scroll after a short timeout to ensure everything has been rendered before
    // we attempt to scroll. Otherwise, we won't scroll at all
    setTimeout(() => {
      setFinishedInitialScrollToBottom(true);
      scrollToBottom();
    }, 250);
  }, [sanitizedOnchainMessages.length, finishedInitialScrollToBottom]);

  const FloatingScrollToBottomButton = () => {
    return (
      <div className="relative">
        <button
          onClick={scrollToBottom}
          className="absolute opacity-50 right-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded-full shadow-md"
        >
          ↓
        </button>
      </div>
    );
  };

  return (
    <>
      <div
        className={cn(
          "whitespace-break-spaces",
          "font-mono",
          "max-h-60",
          "w-full",
          "overflow-y-scroll",
          "overflow-x-hidden"
        )}
        ref={scrollContainerRef}
      >
        {messages.map((message, idx) => (
          <div key={idx}>
            <p className="text-left">{message.message}</p>
            <p className="text-right">
              <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} /> |{" "}
              {nftMsgSenderTokenIds != null ? (
                <>
                  Willie #{nftMsgSenderTokenIds[idx].toString()}{" "}
                  <img src={nftMsgSenderImages[idx]} className="inline w-12" />
                </>
              ) : (
                message.sender
              )}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {showScrollButton && <FloatingScrollToBottomButton />}
    </>
  );
}
