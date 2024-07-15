import { Chain } from "viem/chains";
import {
  CHAIN_ID_TO_OPENSEA_CHAIN_MAP,
  SVG_MIME_TYPE,
  WEBSITE_BASE_URL,
} from "./constants";
import { createPublicClient, http } from "viem";
import { INSCRIBED_DROPS_CONTRACT } from "@/components/core/net-apps/inscribed-drops/constants";

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

export function chainIdToChain(chainId: number) {
  return CHAIN_ID_TO_OPENSEA_CHAIN_MAP.find((m) => m.chain.id === chainId)
    ?.chain;
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

export async function uploadToNftStorage(
  file: File
): Promise<{ ipfsUrl?: string; error?: string }> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/uploadToIpfs", {
    method: "POST",
    body,
  });
  const resJson = await res.json();

  if (resJson.error) {
    return { error: resJson.error };
  }
  if (resJson.ipfsUrl) {
    return { ipfsUrl: resJson.ipfsUrl };
  }
  return { error: "Failed to upload" };
}

export function getResizedImageUrl(imageUrl: string) {
  return `${WEBSITE_BASE_URL}/api/resizeImage?imageUrl=${encodeURIComponent(
    imageUrl
  )}`;
}

export function isSvgDataUri(url: string) {
  return url.startsWith("data:image/svg+xml;base64,");
}

export function getRpcUrl(chainId: number) {
  return chainIdToChain(chainId)?.rpcUrls.default.http[0];
}
