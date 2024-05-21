import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIBE_DROP_INSCRIBE_TOPIC,
} from "./constants";
import {
  chainIdToOpenSeaChainString,
  openSeaChainStringToChain,
  publicClient,
} from "@/app/utils";
import { MintConfigDefined } from "./page/InscribeDropMintConfigEntry";
import { fromHex } from "viem";
import { OnchainMessage } from "../../types";
import { WILLIE_NET_CONTRACT } from "@/app/constants";
import { readContract } from "viem/actions";

export function getInscribedDropUrlForTokenId(
  tokenId: string,
  chainId: number
) {
  const chainString = chainIdToOpenSeaChainString(chainId);
  return `https://testnets.opensea.io/assets/${chainString}/${INSCRIBED_DROPS_CONTRACT.address}/${tokenId}`;
}

type InscribedDrop = {
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
      priceInEth: msgDataFields[0],
      maxSupply: msgDataFields[1],
      mintEndTimestamp: msgDataFields[2],
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
}
