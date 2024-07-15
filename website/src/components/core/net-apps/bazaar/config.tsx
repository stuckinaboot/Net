import {
  chainIdToChain,
  chainIdToOpenSeaChainString,
  publicClient,
} from "@/app/utils";
import {
  InferredAppComponentsConfig,
  StandaloneAppComponentsConfig,
} from "../../types";
import { readContract } from "viem/actions";
import Link from "next/link";
import { CHAINS, HAM_CHAIN } from "@/app/constants";
import { baseSepolia } from "viem/chains";

export const standaloneConfig: StandaloneAppComponentsConfig = {
  getTransformedMessage: async (chainId, messageText) => {
    try {
      const hashTagIndex = messageText.indexOf("#");
      if (hashTagIndex === -1) {
        return messageText;
      }
      const chain = chainIdToChain(chainId);
      if (chain == null) {
        return undefined;
      }
      // const uri = (await readContract(publicClient(chain), {
      //   address: INSCRIBED_DROPS_CONTRACT.address as any,
      //   abi: INSCRIBED_DROPS_CONTRACT.abi,
      //   functionName: "tokenURI",
      //   args: [dropId],
      // })) as any;
      return "hello";
    } catch (e) {
      // This may throw due to RPC errors or the contract not implementing the above function.
      // In either case, gracefully return undefined
      return messageText;
    }
  },
};

export const inferredAppConfig: InferredAppComponentsConfig = {
  supportedChains: new Set(
    CHAINS.filter(
      (chain) => chain.name === "Ham" || chain.name === "Base Sepolia"
    ).map((chain) => chain.id)
  ),
  infer: (message: string, chainId: number) =>
    convertMessageToListingComponents(message, chainId) != null,
  dialogContents: InscriptionDialogContents,
  transactionExecutor: {
    parameters: (message: string) => ({
      abi: INSCRIPTIONS_CONTRACT.abi,
      args: [message],
      functionName: "inscribe",
    }),
  },
  toasts: {
    success: { description: "You successfully inscribed an NFT on Net" },
  },
};
