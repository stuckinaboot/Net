import { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { getOwnedNftTokenIds } from "@/app/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SendMessageSection from "./SendMessageSection";
import { Separator } from "@/components/ui/separator";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import useAsyncEffect from "use-async-effect";
import MessagesDisplay from "./MessagesDisplay";
import FloatingScrollToBottomButton from "./FloatingScrollToBottomButton";
import ChatSelectorDropdown from "./ChatSelectorDropdown";

const CHAT_ROOM_ITEMS = [
  "Global",
  "Onchain Steamboat Willies",
  "Onchain Dinos",
];

export default function OnchainMessages(props: { nftAddress?: string }) {
  const { isConnected, address: userAddress } = useAccount();
  const [ownedNftTokenIds, setOwnedNftTokenIds] = useState([]);
  const [chatRoom, setChatRoom] = useState(CHAT_ROOM_ITEMS[0]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
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

  useAsyncEffect(async () => {
    if (props.nftAddress == null || !isConnected) {
      return;
    }
    const tokenIds = await getOwnedNftTokenIds({
      userAddress: userAddress as string,
      contractAddress: props.nftAddress,
    });
    setOwnedNftTokenIds(tokenIds);
  }, [isConnected]);

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex flex-col">
        <div className="flex flex-row justify-between">
          <CardTitle>
            {isValidNftAddress ? `WillieNet: ${props.nftAddress}` : "WillieNet"}
          </CardTitle>
          <ConnectButton />
        </div>
        <CardDescription>
          All messages are stored and read onchain and are publicly accessible.
          <ChatSelectorDropdown
            className="flex flex-col justify-end"
            items={CHAT_ROOM_ITEMS}
            selected={chatRoom}
            onItemClicked={(item) => setChatRoom(item)}
          />
        </CardDescription>
      </CardHeader>
      <CardContent
        className="flex-1 flex-col overflow-y-auto"
        ref={scrollContainerRef}
      >
        <MessagesDisplay
          nftAddress={props.nftAddress}
          scrollToBottom={scrollToBottom}
        />
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="flex flex-col">
        {showScrollButton && (
          <FloatingScrollToBottomButton onClick={scrollToBottom} />
        )}
      </div>
      <CardFooter className="flex flex-col justify-end">
        <Separator className="m-3" />
        {isValidNftAddress &&
        props.nftAddress &&
        ownedNftTokenIds.length > 0 ? (
          <SendMessageSection
            nft={{ address: props.nftAddress, tokenId: ownedNftTokenIds[0] }}
          />
        ) : !isValidNftAddress ? (
          <SendMessageSection />
        ) : (
          <p>No NFTs owned in {props.nftAddress}</p>
        )}
      </CardFooter>
    </Card>
  );
}
