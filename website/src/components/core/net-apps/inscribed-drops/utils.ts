import { INSCRIBED_DROPS_CONTRACT } from "./constants";
import { chainIdToOpenSeaChainString } from "@/app/utils";

export function getInscribedDropUrlForTokenId(
  tokenId: string,
  chainId: number
) {
  const chainString = chainIdToOpenSeaChainString(chainId);
  return `https://testnets.opensea.io/assets/${chainString}/${INSCRIBED_DROPS_CONTRACT.address}/${tokenId}`;
}
