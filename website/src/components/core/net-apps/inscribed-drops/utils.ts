import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIBE_DROP_INSCRIBE_TOPIC,
} from "./constants";
import {
  chainIdToChainString,
  getResizedImageUrl,
  isSvgDataUri,
  openSeaChainStringToChain,
  publicClient,
} from "@/app/utils";
import { MintConfigDefined } from "./page/InscribeDropMintConfigEntry";
import { formatEther, fromHex, parseEther } from "viem";
import { OnchainMessage } from "../../types";
import { TESTNETS_ENABLED, WILLIE_NET_CONTRACT } from "@/app/constants";
import { readContract } from "viem/actions";
import { IPFS_GATEWAY, sanitizeMediaUrl } from "../../utils";

export function getInscribedDropUrlForTokenId(
  tokenId: string,
  chainId: number
) {
  const chainString = chainIdToChainString(chainId);
  return TESTNETS_ENABLED
    ? `https://testnets.opensea.io/assets/${chainString}/${INSCRIBED_DROPS_CONTRACT.address}/${tokenId}`
    : `https://opensea.io/assets/${chainString}/${INSCRIBED_DROPS_CONTRACT.address}/${tokenId}`;
}

export type InscribedDrop = {
  metadata: {
    name: string;
    description: string;
    image: string;
    animationUrl: string;
    traits: any;
  };
  mintConfig: MintConfigDefined;
  creator: string;
};

export function getInscribedDropFromOnchainMessage(
  data: OnchainMessage
): InscribedDrop | undefined {
  if (data == null) {
    return undefined;
  }

  const msgDataFields: number[] = [];
  const msgData = data.data.substring(2);
  for (let i = 0; i < msgData.length; i += 64) {
    msgDataFields.push(fromHex(`0x${msgData.substring(i, i + 64)}`, "number"));
  }
  if (msgDataFields.length < 3) {
    return undefined;
  }

  let textTyped;
  try {
    textTyped = JSON.parse(data.text);
  } catch (e) {
    return undefined;
  }

  return {
    mintConfig: {
      priceInEth: +formatEther(BigInt(msgDataFields[0].toString())),
      maxSupply: msgDataFields[1],
      mintEndTimestamp: msgDataFields[2],
      maxMintsPerWallet: msgDataFields[3],
    },
    metadata: {
      name: textTyped.name,
      description: textTyped.description,
      image: textTyped.image,
      animationUrl: textTyped.animation_url,
      traits: textTyped.traits,
    },
    creator: data.sender,
  };
}

export async function getInscribedDrop(params: {
  chainIdString: string;
  tokenId: string;
}) {
  try {
    const chain = openSeaChainStringToChain(params.chainIdString);
    if (chain == null) {
      return undefined;
    }

    const res: OnchainMessage | undefined = (await readContract(
      publicClient(chain),
      {
        address: WILLIE_NET_CONTRACT.address as any,
        abi: WILLIE_NET_CONTRACT.abi,
        functionName: "getMessageForAppTopic",
        args: [
          params.tokenId,
          INSCRIBED_DROPS_CONTRACT.address,
          INSCRIBE_DROP_INSCRIBE_TOPIC,
        ],
      }
    )) as OnchainMessage;
    if (res == null) {
      return undefined;
    }
    return getInscribedDropFromOnchainMessage(res);
  } catch (e) {
    console.log("Error getting inscribed drop", e);
    return undefined;
  }
}

// TODO support multiple chains
export async function getFrameImageUrl(params: {
  imageUrl: string;
  tokenId: string;
  chain?: string;
}) {
  const sanitizedImageUrl = sanitizeMediaUrl(
    params.imageUrl,
    IPFS_GATEWAY.NFT_STORAGE
  );
  if (isSvgDataUri(sanitizedImageUrl)) {
    // Use opensea image for SVGs, as resizing SVGs is not supported.
    // NOTE: this does imply users of this functino must wait for OpenSea to index the NFT
    // before this function will return accurate results
    try {
      const res = await fetch(
        `/api/opensea/getImageForToken?contractAddress=${INSCRIBED_DROPS_CONTRACT.address}&tokenId=${params.tokenId}`
      );
      const osImageUrl = (await res.json()).imageUrl;
      return osImageUrl;
    } catch (e) {
      return sanitizedImageUrl;
    }
  }
  return getResizedImageUrl(sanitizedImageUrl);
}
