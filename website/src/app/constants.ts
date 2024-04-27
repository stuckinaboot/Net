import willienetAbi from "../../assets/abis/willienet.json";
import nftGatedChatAbi from "../../assets/abis/nft-gated-chat.json";

export const testnetsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";

export const WILLIE_NET_CONTRACT = {
  address: testnetsEnabled
    ? "0xa84cc9d1814b41b32baf692dce1d3b15623e333f"
    : "0xabc",
  abi: willienetAbi,
};

export const NFT_GATED_CHAT_CONTRACT = {
  address: testnetsEnabled
    ? "0xDB4EAB0C91ac1483d5c25E615dfa0b3993E442C2"
    : "0xabc",
  abi: nftGatedChatAbi,
};

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const IS_PROD = process.env.NODE_ENV === "production";

export const WEBSITE_BASE_URL = IS_PROD
  ? "https://willienet.vercel.app"
  : "http://localhost:3000";
