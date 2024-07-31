import { HAM_CHAIN } from "@/app/constants";
import { base, baseSepolia, degen } from "viem/chains";

export const NFT_CHAIN_NAME_ADDRESS_MAPPING: {
  [chainId: number]: { [name: string]: string };
} = {
  [HAM_CHAIN.id]: {
    dino: "0xAbCdefC26dAc279770D07eE513668b5aB74718e3",
    punk: "0xd1Ee96F8859Da046781cACa35EF0FF2A0307570C",
    lp: "0x68f343bC08D1C093754a74F2b45a69A2f1A42872",
  },
  [degen.id]: { punk: "0x8a53ed5189ca8d5cac4149d75408cec047cd5b2e" },
  [baseSepolia.id]: { dino: "0xAbCdefC26dAc279770D07eE513668b5aB74718e3" },
  [base.id]: { test: "" },
};

export const NFT_ADDRESS_NAME_MAPPING: {
  [address: string]: string;
} = {
  "0xAbCdefC26dAc279770D07eE513668b5aB74718e3": "ham dino",
  "0xd1Ee96F8859Da046781cACa35EF0FF2A0307570C": "ham punk",
  "0x68f343bC08D1C093754a74F2b45a69A2f1A42872": "ham lp",
  "0x8a53ed5189ca8d5cac4149d75408cec047cd5b2e": "degen punk",
};

export function getDefaultCurrencySymbolForChain(chainId: number) {
  if (chainId === HAM_CHAIN.id) {
    return "eth";
  }
  if (chainId === degen.id) {
    return "degen";
  }
  return "eth";
}

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
