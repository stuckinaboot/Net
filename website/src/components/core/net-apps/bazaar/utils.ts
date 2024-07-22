import { HAM_CHAIN } from "@/app/constants";
import { base, baseSepolia } from "viem/chains";

export const NFT_CHAIN_NAME_ADDRESS_MAPPING: {
  [chainId: number]: { [name: string]: string };
} = {
  [HAM_CHAIN.id]: { lp: "" },
  [baseSepolia.id]: { test: "0x32ecf0b854139335faba683a1f4e65e7d941acf1" },
  [base.id]: { test: "" },
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

  return {
    item: {
      name,
      address: nameAddressMappingForChain[name],
      tokenId: tokenIdStr,
    },
    price: parsedPrice,
    currency,
  };
}

export function getTimestampInSecondsNHoursFromNow(n: number) {
  return Math.floor(
    Date.now() / 1000 +
      // 60 minutes per hour, 60 seconds per minute
      n * 60 * 60
  );
}