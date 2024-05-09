import willienetAbi from "../../assets/abis/willienet.json";
import nftGatedChatAbi from "../../assets/abis/nft-gated-chat.json";

export const TESTNETS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";

export const WILLIE_NET_CONTRACT = {
  address: TESTNETS_ENABLED
    ? "0x0000000a5ef8b5d6fea2cac7ca166e50fa752db0"
    : "0xabc",
  abi: willienetAbi,
};

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const IS_PROD = process.env.NODE_ENV === "production";

export const WEBSITE_BASE_URL = IS_PROD
  ? "https://willienet.vercel.app"
  : "http://localhost:3000";

export const SHOW_COPY_MESSAGE_LINK_BUTTON = false;
