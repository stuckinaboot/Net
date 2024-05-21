import { base, baseSepolia, degen, sepolia } from "viem/chains";
import willienetAbi from "../../assets/abis/willienet.json";

export const TESTNETS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";
export const IS_PROD = process.env.NODE_ENV === "production";
export const WEBSITE_BASE_URL = IS_PROD
  ? "https://willienet.vercel.app"
  : "http://localhost:3000";

export const WILLIE_NET_CONTRACT = {
  address: TESTNETS_ENABLED
    ? "0x00000000b24d62781db359b07880a105cd0b64e6"
    : "0x00000000b24d62781db359b07880a105cd0b64e6",
  abi: willienetAbi,
};

export const NULL_ADDRESS = "0x0000000000000000000000000000000000000000";

export const SHOW_COPY_MESSAGE_LINK_BUTTON = false;

// Maps chain ID to opensea chain string that is used in public OpenSea URLs
export const CHAIN_ID_TO_OPENSEA_CHAIN_MAP = [
  { chain: baseSepolia, openSeaChainString: "base-sepolia" },
  { chain: sepolia, openSeaChainString: "sepolia" },
  { chain: base, openSeaChainString: "base" },
  { chain: degen, openSeaChainString: "degen" },
];
