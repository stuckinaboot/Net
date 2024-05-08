import {
  NFT_GATED_CHAT_CONTRACT,
  NULL_ADDRESS,
  WILLIE_NET_CONTRACT,
} from "@/app/constants";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import truncateEthAddress from "truncate-eth-address";
import { useChainId, useReadContract } from "wagmi";
import isHtml from "is-html";
import IframeRenderer from "./IFrameRenderer";
import NftGatingProvider from "./nft-gating/NftGatingProvider";
import { NetAppConfig, SanitizedOnchainMessage } from "./types";
import NftGatingMessageRenderer from "./nft-gating/NftGatingMessageRenderer";
import { useSearchParams } from "next/navigation";
import { getContractReadArgs } from "./nft-gating/NftGatingArgs";
import DefaultMessageRenderer from "./DefaultMessageRenderer";

type OnchainMessage = {
  data: string;
  text: string;
  sender: string;
  app: string;
  timestamp: BigInt;
  topic: string;
};

const PRE_SCROLL_TIMEOUT_MS = 250;

export default function MessagesDisplay(props: {
  scrollToBottom: () => void;
  checkAndUpdateShouldShowScrollToBottomButton: () => void;
  initialVisibleMessageIndex?: number;
  appConfig?: NetAppConfig;
}) {
  const [chainChanged, setChainChanged] = useState(false);
  const [messages, setMessages] = useState<SanitizedOnchainMessage[]>([]);
  const [firstLoadedMessages, setFirstLoadedMessages] = useState(false);
  const specificMessageRef = useRef<HTMLDivElement | null>(null);
  const chainId = useChainId();

  const totalMessagesReadContractArgs =
    props.appConfig != null
      ? getContractReadArgs(props.appConfig).totalMessages
      : {
          abi: WILLIE_NET_CONTRACT.abi,
          address: WILLIE_NET_CONTRACT.address as any,
          functionName: "getTotalMessagesForAppCount",
          query: {
            refetchInterval: 2000,
          },
          args: [NULL_ADDRESS],
        };

  const totalMessagesResult = useReadContract(totalMessagesReadContractArgs);
  const messagesResultsReadContractArgs = props.appConfig
    ? getContractReadArgs(props.appConfig).messages({
        startIndex: 0,
        endIndex: +(totalMessagesResult.data || 0).toString(),
      })
    : {
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getMessagesInRangeForApp",
        args: [BigInt(0), totalMessagesResult.data, NULL_ADDRESS],
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

  function scrollToSpecificMessageAfterTimeout() {
    // Attempt to scroll after a short timeout to ensure everything has been rendered before
    // we attempt to scroll. Otherwise, we won't scroll at all
    setTimeout(() => {
      specificMessageRef.current?.scrollIntoView({ behavior: "instant" });
    }, PRE_SCROLL_TIMEOUT_MS);
  }

  useEffect(() => {
    setChainChanged(true);
  }, [chainId]);

  useEffect(() => {
    if (!chainChanged || !messagesResult.isFetched) {
      return;
    }
    setChainChanged(false);
    // Scroll on chain changed and messages fetched
    setTimeout(() => {
      props.scrollToBottom();
    }, PRE_SCROLL_TIMEOUT_MS);
  }, [chainChanged, messagesResult.isFetched]);

  useEffect(() => {
    if (!messagesResult.isFetched) {
      return;
    }
    // Updating messages using state and skipping when not fetched
    // gets rid of the flicker of loading messages
    setMessages(sanitizedOnchainMessages);
  }, [sanitizedOnchainMessages.length, messagesResult.isFetched]);

  useEffect(() => {
    // This is called whenever the state finishes being set, implying the messages
    // are rendered.
    props.checkAndUpdateShouldShowScrollToBottomButton();
  }, [messages.length]);

  useEffect(() => {
    if (firstLoadedMessages || sanitizedOnchainMessages.length === 0) {
      return;
    }
    scrollToSpecificMessageAfterTimeout();
  }, [sanitizedOnchainMessages.length, firstLoadedMessages]);

  const ConditionalProvider = ({ children }: { children?: React.ReactNode }) =>
    props.appConfig != null ? (
      <NftGatingProvider
        messageRange={{
          startIndex: 0,
          endIndex: +(totalMessagesResult.data != null
            ? +totalMessagesResult.data.toString()
            : 0),
        }}
        appConfig={props.appConfig}
      >
        {children}
      </NftGatingProvider>
    ) : (
      <>{children}</>
    );

  return (
    <ConditionalProvider>
      <div className="flex flex-col">
        <div
          className={cn(
            "flex",
            "flex-col",
            "whitespace-break-spaces",
            "w-full",
            "overflow-x-hidden"
          )}
        >
          {messages.map((message, idx) => (
            <div
              key={idx}
              className="flex flex-col"
              ref={
                idx == props.initialVisibleMessageIndex
                  ? specificMessageRef
                  : undefined
              }
            >
              {props.appConfig ? (
                <NftGatingMessageRenderer idx={idx} message={message} />
              ) : (
                <DefaultMessageRenderer idx={idx} message={message} />
              )}
            </div>
          ))}
        </div>
      </div>
    </ConditionalProvider>
  );
}
