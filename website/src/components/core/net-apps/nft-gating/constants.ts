import { TESTNETS_ENABLED } from "@/app/constants";
import nftGatedChatAbi from "../../../../../assets/abis/nft-gated-chat.json";

export const NFT_GATED_CHAT_CONTRACT = {
  address: TESTNETS_ENABLED
    ? "0x3d9d7f4646028847c84539855e2d8d63ebe11991"
    : "0xabc",
  abi: nftGatedChatAbi,
};
