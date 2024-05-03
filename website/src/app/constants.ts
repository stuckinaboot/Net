import willienetAbi from "../../assets/abis/willienet.json";
import nftGatedChatAbi from "../../assets/abis/nft-gated-chat.json";

export const testnetsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";

export const WILLIE_NET_CONTRACT = {
  address: testnetsEnabled
    ? "0x000000dceb2eee94ed932c3d1d247fe89af0a5bd"
    : "0xabc",
  abi: willienetAbi,
};

export const NFT_GATED_CHAT_CONTRACT = {
  address: testnetsEnabled
    ? "0xbe70138e5478690302eed6044737ef081fcc6218"
    : "0xabc",
  abi: nftGatedChatAbi,
};

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const IS_PROD = process.env.NODE_ENV === "production";

export const WEBSITE_BASE_URL = IS_PROD
  ? "https://willienet.vercel.app"
  : "http://localhost:3000";
