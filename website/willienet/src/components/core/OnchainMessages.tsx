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

export default function OnchainMessages(props: { nftAddress?: string }) {
  const { isConnected, address: userAddress } = useAccount();
  const [chatRoom, setChatRoom] = useState(CHAT_ROOM_ITEMS[0]);
  const [selectedNftTokenId, setSelectedNftTokenId] = useState<string>();

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

  const nftAddressFromItem = nftAddressFromChatRoomItem(chatRoom);

  const disableSendMessageSection = !isConnected;
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
