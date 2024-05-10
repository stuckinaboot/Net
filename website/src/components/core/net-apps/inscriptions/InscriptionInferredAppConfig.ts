import { base, baseSepolia } from "viem/chains";
import { InscriptionDialogContents } from "./InscriptionDialogContents";
import { InferredAppComponentsConfig } from "../../types";
import { TESTNETS_ENABLED } from "@/app/constants";
import abi from "../../../../../assets/abis/apps/inscriptions.json";

const SUPPORTED_CHAINS = new Set([base.id, baseSepolia.id]);

export const INSCRIPTIONS_CONTRACT = {
  address: TESTNETS_ENABLED
    ? "0x00000000bDdf795Cc4a1B8107aF795f434f705ED"
    : "0x00000000bDdf795Cc4a1B8107aF795f434f705ED",
  abi: abi,
};

export const config: InferredAppComponentsConfig = {
  supportedChains: SUPPORTED_CHAINS,
  infer: (message: string) => {
    try {
      const parsed = JSON.parse(message);
      return parsed["image"] != null || parsed["animation_url"] != null;
    } catch (e) {
      return false;
    }
  },
  dialogContents: InscriptionDialogContents,
  getTransactionParameters: (message: string) => ({
    abi: INSCRIPTIONS_CONTRACT.abi,
    args: [message],
    functionName: "inscribe",
  }),
  toasts: {
    success: { description: "You successfully inscribed an NFT on Net" },
  },
};
