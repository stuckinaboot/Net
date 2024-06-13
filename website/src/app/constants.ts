import { base, baseSepolia, degen, sepolia } from "wagmi/chains";
import willienetAbi from "../../assets/abis/willienet.json";
import { defineChain } from "viem";

export const TESTNETS_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true";
export const IS_PROD = process.env.NODE_ENV === "production";
export const WEBSITE_BASE_URL =
  IS_PROD && TESTNETS_ENABLED
    ? "https://testnets.netprotocol.app"
    : IS_PROD
    ? "https://netprotocol.app"
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
  {
    chain: baseSepolia,
    openSeaChainString: "base-sepolia",
    crossChainId: "eip155:84532",
  },
  {
    chain: sepolia,
    openSeaChainString: "sepolia",
    crossChainId: "eip155:11155111",
  },
  { chain: base, openSeaChainString: "base", crossChainId: "eip155:8453" },
  {
    chain: degen,
    openSeaChainString: "degen",
    crossChainId: "eip155:666666666",
  },
];

export const HAM_CHAIN = defineChain({
  id: 5112,
  name: "Ham",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.ham.fun"],
    },
    public: {
      http: ["https://rpc.ham.fun"],
    },
  },
  iconUrls: [
    "https://black-tough-rodent-563.mypinata.cloud/ipfs/QmcbYVenTET9HBS7vs7SGv1MNqnRscAKVF5kaRVHaVCfvs",
  ],
  blockExplorers: {
    default: {
      name: "Ham Chain Explorer",
      url: "explorer.ham.fun",
    },
  },
  testnet: false,
});

export const CHAINS = TESTNETS_ENABLED
  ? [baseSepolia, sepolia]
  : [base, HAM_CHAIN, degen];

export const SVG_MIME_TYPE = "image/svg+xml";
