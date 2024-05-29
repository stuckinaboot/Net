import { TESTNETS_ENABLED } from "@/app/constants";
import abi from "../../../../../assets/abis/apps/inscribed-drops.json";

export const INSCRIBED_DROPS_COLLECTION_URL = TESTNETS_ENABLED
  ? "https://testnets.opensea.io/collection/inscribed-drops-4"
  : "https://opensea.io/collection/net-inscriptions";

export const INSCRIBED_DROPS_CONTRACT = {
  abi,
  address: "0x000000001c147E48f5aaD3C69e8E4d2305523c62",
};

// Corresponds to the constant in the Inscribed Drops contract
export const INSCRIBE_DROP_INSCRIBE_TOPIC = "i";
