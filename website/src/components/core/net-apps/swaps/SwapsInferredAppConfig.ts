import { base, baseSepolia, degen } from "viem/chains";
import { InferredAppComponentsConfig } from "../../types";
import { SwapsDialogContents } from "./SwapsDialogContents";
import { parseMessageToSwap } from "./utils";

const SUPPORTED_CHAINS = new Set([base.id, baseSepolia.id]);

export const config: InferredAppComponentsConfig = {
  supportedChains: SUPPORTED_CHAINS,
  infer: (message: string) => parseMessageToSwap(message) != null,
  dialogContents: SwapsDialogContents,
  getTransactionParameters: (message: string) => ({
    abi: INSCRIPTIONS_CONTRACT.abi,
    args: [message],
    functionName: "inscribe",
  }),
  toasts: {
    success: { description: "You successfully inscribed an NFT on Net" },
  },
};
