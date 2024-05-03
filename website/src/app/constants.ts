import willienetAbi from "../../assets/abis/willienet.json";
import nftGatedChatAbi from "../../assets/abis/nft-gated-chat.json";

export const testnetsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";

export const WILLIE_NET_CONTRACT = {
  address: testnetsEnabled
    ? "0x00000004EEC36AB5a79ee6084177ebAB55B1Ea4b"
    : "0xabc",
  abi: willienetAbi,
};

export const NFT_GATED_CHAT_CONTRACT = {
  address: testnetsEnabled
    ? "0x39e262f31151abc9add42b63c1c15beac04c2948"
    : "0xabc",
  abi: nftGatedChatAbi,
};

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const IS_PROD = process.env.NODE_ENV === "production";

export const WEBSITE_BASE_URL = IS_PROD
  ? "https://willienet.vercel.app"
  : "http://localhost:3000";
