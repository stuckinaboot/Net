import { TESTNETS_ENABLED } from "@/app/constants";
import NftCollectionSelectorDropdown from "../../NftCollectionSelectorDropdown";
import { useEffect, useState } from "react";
import NftSelector from "../../NftSelector";
import { AppControlsProps } from "../../types";

const ONCHAIN_STEAMBOAT_WILLIES_CHAT_ROOM_ITEM = "Onchain Steamboat Willies";
const CHAT_ROOM_ITEMS = [
  // TODO re-enable once nft chat is deployed to counterfactual address across chains
  ONCHAIN_STEAMBOAT_WILLIES_CHAT_ROOM_ITEM,
];

function nftAddressFromChatRoomItem(chatRoomItem: string) {
  if (chatRoomItem === ONCHAIN_STEAMBOAT_WILLIES_CHAT_ROOM_ITEM) {
    return TESTNETS_ENABLED
      ? "0x788d33297f559337bf42136ec86d1de75f24b2aa"
      : "todo";
  }
}

export default function NftGatingControls(props: AppControlsProps) {
  const [chatRoom, setChatRoom] = useState(CHAT_ROOM_ITEMS[0]);
  const [selectedNftTokenId, setSelectedNftTokenId] = useState<string>();

  const nftAddressFromItem = nftAddressFromChatRoomItem(chatRoom);

  useEffect(() => {
    props.updateControlsState({
      ...props.controlsState,
      nftAddress: nftAddressFromItem as string,
    });
  }, []);

  return (
    <>
      <NftCollectionSelectorDropdown
        className="flex flex-col justify-end"
        items={CHAT_ROOM_ITEMS}
        selected={chatRoom}
        onItemClicked={(item) => {
          setChatRoom(item);
          props.updateControlsState({
            ...props.controlsState,
            chatRoom: item,
          });
        }}
      />
      {props.userAddress && nftAddressFromItem && (
        <NftSelector
          userAddress={props.userAddress}
          contractAddress={nftAddressFromItem}
          onTokenIdClicked={(tokenId: string) => {
            setSelectedNftTokenId(tokenId);
            props.updateControlsState({
              ...props.controlsState,
              nftAddress: nftAddressFromItem,
              selectedNftTokenId: tokenId,
            });
          }}
          selectedTokenId={selectedNftTokenId}
        />
      )}
    </>
  );
}
