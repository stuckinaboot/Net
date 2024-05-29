import { TESTNETS_ENABLED } from "@/app/constants";
import abi from "../../../../../assets/abis/apps/inscribed-drops.json";

export const INSCRIBED_DROPS_COLLECTION_URL = TESTNETS_ENABLED
  ? "https://testnets.opensea.io/collection/inscribed-drops-4"
  : "https://opensea.io/collection/net-inscriptions";

export const INSCRIBED_DROPS_CONTRACT = {
  abi,
  address: "0x00000000c7AAcaEb85756F9bc59B0D0D6eee95cf",
};

// Corresponds to the constant in the Inscribed Drops contract
export const INSCRIBE_DROP_INSCRIBE_TOPIC = "i";
