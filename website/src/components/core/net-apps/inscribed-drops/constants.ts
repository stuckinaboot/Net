import { TESTNETS_ENABLED } from "@/app/constants";
import abi from "../../../../../assets/abis/apps/inscribed-drops.json";

export const INSCRIBED_DROPS_COLLECTION_URL = TESTNETS_ENABLED
  ? "https://testnets.opensea.io/collection/inscribed-drops"
  : "https://opensea.io/collection/net-inscriptions";

export const INSCRIBED_DROPS_CONTRACT = {
  abi,
  address: "0x000000E388e564884C32cA75A6850C7D62F8E56F",
};
