import { TESTNETS_ENABLED } from "@/app/constants";

export const INSCRIPTIONS_COLLECTION_URL = TESTNETS_ENABLED
  ? "https://testnets.opensea.io/collection/net-inscriptions-3"
  : "https://opensea.io/collection/net-inscriptions";

export const INSCRIBED_DROPS_CONTRACT = {
  abi: "todo" as any,
  address: "todo" as any,
};
