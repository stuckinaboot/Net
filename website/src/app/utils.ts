import { Chain } from "viem/chains";
import { CHAIN_ID_TO_OPENSEA_CHAIN_MAP, WEBSITE_BASE_URL } from "./constants";
import { createPublicClient, http } from "viem";

export function chainTimeToMilliseconds(chainTime: number) {
  return chainTime * 1000;
}

export function getUrlForSpecificMessageIndex(specificMessageIndex: number) {
  return `${WEBSITE_BASE_URL}?specificMessageIndex=${specificMessageIndex}`;
}

export async function getOwnedNftTokenIds(params: {
  userAddress: string;
  contractAddress: string;
}): Promise<string[]> {
  const res = await fetch(
    `/api/getTokenIdsOwnedByUserInCollection?owner=${params.userAddress}&contractAddress=${params.contractAddress}`
  );
  const resJson = await res.json();
  return resJson.tokenIds;
}

export async function getNftImages(params: {
  contractAddress: string;
  tokenIds: string[];
}): Promise<string[]> {
  const res = await fetch(
    `/api/getImagesForTokenIdsInCollection?contractAddress=${
      params.contractAddress
    }&tokenIds=${params.tokenIds.join(",")}`
  );
  const resJson = await res.json();
  return resJson.images;
}

export async function getDisplayableErrorMessageFromSubmitTransactionError(
  e: Error
) {
  const msg = e.message;
  const periodIdx = e.message.indexOf(".");
  if (periodIdx === -1) {
    return msg;
  }
  return msg.substring(0, periodIdx);
}

export function chainIdToOpenSeaChainString(chainId: number) {
  return CHAIN_ID_TO_OPENSEA_CHAIN_MAP.find((m) => m.chain.id === chainId)
    ?.openSeaChainString;
}

export function openSeaChainStringToChain(chainString: string) {
  return CHAIN_ID_TO_OPENSEA_CHAIN_MAP.find(
    (m) => m.openSeaChainString === chainString
  )?.chain;
}

export function openSeaChainStringToCrossChainId(chainString: string) {
  return CHAIN_ID_TO_OPENSEA_CHAIN_MAP.find(
    (m) => m.openSeaChainString === chainString
  )?.crossChainId;
}

export function publicClient(chain: Chain) {
  return createPublicClient({
    chain,
    transport: http(),
  });
}
