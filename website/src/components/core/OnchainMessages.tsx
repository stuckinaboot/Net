import { useEffect, useRef, useState } from "react";
import { useAccount, useChainId } from "wagmi";
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
import MessagesDisplay from "./MessagesDisplay";
import FloatingScrollToBottomButton from "./FloatingScrollToBottomButton";
import ChatSelectorDropdown from "./ChatSelectorDropdown";
import NftSelector from "./NftSelector";
import { testnetsEnabled } from "@/app/constants";

const GLOBAL_CHAT_ROOM_ITEM = "Global";
const ONCHAIN_STEAMBOAT_WILLIES_CHAT_ROOM_ITEM = "Onchain Steamboat Willies";
const CHAT_ROOM_ITEMS = [
  GLOBAL_CHAT_ROOM_ITEM,
  ONCHAIN_STEAMBOAT_WILLIES_CHAT_ROOM_ITEM,
];

function nftAddressFromChatRoomItem(chatRoomItem: string) {
  if (chatRoomItem === GLOBAL_CHAT_ROOM_ITEM) {
    return null;
  }
  if (chatRoomItem === ONCHAIN_STEAMBOAT_WILLIES_CHAT_ROOM_ITEM) {
    return testnetsEnabled
      ? "0x788d33297f559337bf42136ec86d1de75f24b2aa"
      : "todo";
  }
}

export default function WillieNetDapp(props: {
  nftAddress?: string;
  specificMessageIndex?: number;
}) {
  const { isConnected, address: userAddress } = useAccount();

  const [chatRoom, setChatRoom] = useState(CHAT_ROOM_ITEMS[0]);
  const [selectedNftTokenId, setSelectedNftTokenId] = useState<string>();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [scrollingToBottom, setScrollingToBottom] = useState(false);
  const [ready, setReady] = useState(false);

  const scrollToBottom = () => {
    setScrollingToBottom(true);
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  function isScrolledToBottom() {
    const scrollContainer = scrollContainerRef.current;
    const targetDiv = messagesEndRef.current;
    if (targetDiv == null || scrollContainer == null) {
      return;
    }

    const containerTop = scrollContainer.getBoundingClientRect().top;
    const { top, bottom } = targetDiv.getBoundingClientRect();

    const scrollIsAboveBottom =
      top > containerTop &&
      bottom > containerTop + scrollContainer.clientHeight;
    return !scrollIsAboveBottom;
  }

  function checkAndUpdateShouldShowScrollToBottomButton() {
    setScrollingToBottom((currScrollingToBottom) => {
      if (currScrollingToBottom && isScrolledToBottom()) {
        // Already scrolled to bottom, so set scrolling to bottom to false
        return false;
      } else if (currScrollingToBottom) {
        // Currently scrolling to bottom, so don't perform any updates
        return currScrollingToBottom;
      }

      const shouldShowScrollBottomButton = !isScrolledToBottom();
      if (shouldShowScrollBottomButton == null) {
        // Null result, so return current value
        return currScrollingToBottom;
      }

      setShowScrollButton((currShowScrollButton) => {
        if (!currShowScrollButton && shouldShowScrollBottomButton) {
          // If not currently showing scroll button and should show scroll button,
          // implies we were previously scrolled to bottom to see latest message.
          // So scroll to bottom again to see the new latest message and continue
          // to not show scroll button
          scrollToBottom();
        }
        return shouldShowScrollBottomButton;
      });
      return currScrollingToBottom;
    });
  }

  useEffect(() => {
    // Component mounted
    setReady(true);
  }, []);

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

  const nftAddressFromItem = nftAddressFromChatRoomItem(chatRoom);

  const disableSendMessageSection = ready && !isConnected;
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
          {chatRoom !== GLOBAL_CHAT_ROOM_ITEM &&
            userAddress &&
            nftAddressFromItem && (
              <NftSelector
                userAddress={userAddress}
                contractAddress={nftAddressFromItem}
                onTokenIdClicked={(tokenId: string) =>
                  setSelectedNftTokenId(tokenId)
                }
                selectedTokenId={selectedNftTokenId}
              />
            )}
        </CardDescription>
      </CardHeader>
      <CardContent
        className="flex-1 flex-col overflow-y-auto"
        ref={scrollContainerRef}
      >
        <MessagesDisplay
          nftAddress={nftAddressFromItem ? nftAddressFromItem : undefined}
          initialVisibleMessageIndex={props.specificMessageIndex}
          scrollToBottom={scrollToBottom}
          checkAndUpdateShouldShowScrollToBottomButton={
            checkAndUpdateShouldShowScrollToBottomButton
          }
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
        {nftAddressFromItem != null && selectedNftTokenId != null ? (
          <SendMessageSection
            nft={{
              address: nftAddressFromItem,
              tokenId: selectedNftTokenId,
            }}
            disabled={disableSendMessageSection}
          />
        ) : (
          <SendMessageSection disabled={disableSendMessageSection} />
        )}
      </CardFooter>
    </Card>
  );
}
