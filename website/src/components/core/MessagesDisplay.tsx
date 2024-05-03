import {
  NFT_GATED_CHAT_CONTRACT,
  NULL_ADDRESS,
  WILLIE_NET_CONTRACT,
} from "@/app/constants";
import {
  chainTimeToMilliseconds,
  getNftImages,
  getUrlForSpecificMessageIndex,
} from "@/app/utils";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import TimeAgo from "react-timeago";
import truncateEthAddress from "truncate-eth-address";
import useAsyncEffect from "use-async-effect";
import { isAddress } from "viem";
import { useReadContract } from "wagmi";
import isHtml from "is-html";
import IframeRenderer from "./IFrameRenderer";
import { CopyIcon } from "@radix-ui/react-icons";
import { useToast } from "@/components/ui/use-toast";
import copy from "copy-to-clipboard";
import Link from "next/link";

type OnchainMessage = {
  extraData: string;
  text: string;
  sender: string;
  app: string;
  timestamp: BigInt;
  topic: string;
};

type SanitizedOnchainMessage = {
  sender: string;
  timestamp: number;
  extraData: string;
  text: string;
  app: string;
  topic: string;
};

const RENDER_HTML = false;

export default function MessagesDisplay(props: {
  scrollToBottom: () => void;
  nftAddress?: string;
  initialVisibleMessageIndex?: number;
}) {
  const [nftMsgSenderImages, setNftMsgSenderImages] = useState<string[]>([]);
  const [messages, setMessages] = useState<SanitizedOnchainMessage[]>([]);
  const [firstLoadedMessages, setFirstLoadedMessages] = useState(false);
  const specificMessageRef = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

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
        functionName: "getTotalMessagesForAppCount",
        query: {
          refetchInterval: 2000,
        },
        args: [NULL_ADDRESS],
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
  useEffect(() => {
    if (messagesResult.data == null) {
      return;
    }
    // Updating messages using state and skipping when message result is undefined
    // the flicker of loading messages
    setMessages(sanitizedOnchainMessages);
  }, [sanitizedOnchainMessages.length]);

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
    if (firstLoadedMessages || sanitizedOnchainMessages.length === 0) {
      return;
    }
    // Attempt to scroll after a short timeout to ensure everything has been rendered before
    // we attempt to scroll. Otherwise, we won't scroll at all
    setTimeout(() => {
      setFirstLoadedMessages(true);
      // props.scrollToBottom();
      specificMessageRef.current?.scrollIntoView({ behavior: "instant" });
    }, 250);
  }, [sanitizedOnchainMessages.length, firstLoadedMessages]);

  function getRenderedMessage(message: string) {
    if (RENDER_HTML && isHtml(message)) {
      return <IframeRenderer htmlString={message} />;
    }
    return message;
  }

  return (
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
        {nftMsgSenderTokenIds != null &&
        nftMsgSenderTokenIds.length !== messages.length ? (
          <p className="flex text-left">Loading messages in NFT chat</p>
        ) : (
          messages.map((message, idx) => (
            <div
              key={idx}
              className="flex flex-col"
              ref={
                idx == props.initialVisibleMessageIndex
                  ? specificMessageRef
                  : undefined
              }
            >
              <p className="flex text-left">
                {getRenderedMessage(message.text)}
              </p>
              <p className="flex justify-end">
                <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} /> |{" "}
                {nftMsgSenderTokenIds != null ? (
                  <>
                    Willie #{nftMsgSenderTokenIds[idx].toString()}{" "}
                    {/* Making the image too big causes weird scroll issues on message send */}
                    <img src={nftMsgSenderImages[idx]} className="inline w-6" />
                  </>
                ) : (
                  message.sender
                )}{" "}
                | Message #{idx}{" "}
                <button
                  onClick={() => {
                    const url = getUrlForSpecificMessageIndex(idx);
                    copy(url);
                    toast({
                      title: "Copied link",
                      description: (
                        <>
                          Successfully copied the link to message #{idx} to your
                          clipboard
                        </>
                      ),
                    });
                  }}
                >
                  <CopyIcon />
                </button>
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
