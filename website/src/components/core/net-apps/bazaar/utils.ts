import { HAM_CHAIN } from "@/app/constants";
import { baseSepolia } from "viem/chains";

export const NFT_CHAIN_NAME_ADDRESS_MAPPING: {
  [chainId: number]: { [name: string]: string };
} = {
  [HAM_CHAIN.id]: { lp: "" },
  [baseSepolia.id]: { test: "" },
};

export function convertMessageToListingComponents(
  message: string,
  chainId: number
) {
  const sanitizedMsg = message.toLowerCase();
  const split = sanitizedMsg.split(" ");
  if (split[0] !== "list") {
    return null;
  }

  const nameAddressMappingForChain = NFT_CHAIN_NAME_ADDRESS_MAPPING[chainId];
  if (nameAddressMappingForChain == null) {
    return null;
  }

  const name = split[1];
  if (nameAddressMappingForChain[name] == null) {
    return null;
  }

  const tokenIdStr = split[2];
  if (split[3] !== "for") {
    return null;
  }

  const price = split[4];
  if (price == null) {
    return null;
  }
  let parsedPrice;
  try {
    parsedPrice = parseFloat(price);
  } catch {
    return null;
  }

  const currency = split[5];
  if (currency !== "eth") {
    return null;
  }

  return { name, price: parsedPrice, tokenId: tokenIdStr, currency };
}
