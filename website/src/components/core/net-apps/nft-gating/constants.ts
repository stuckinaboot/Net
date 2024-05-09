import { TESTNETS_ENABLED } from "@/app/constants";
import nftGatedChatAbi from "../../../../../assets/abis/nft-gated-chat.json";

export const NFT_GATED_CHAT_CONTRACT = {
  address: TESTNETS_ENABLED
    ? "0xbcdadbd75e30f645997ef94dd38ec6c1fb1c6ed1"
    : "0xabc",
  abi: nftGatedChatAbi,
};
