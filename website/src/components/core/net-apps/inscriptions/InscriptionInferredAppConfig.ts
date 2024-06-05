import { InscriptionDialogContents } from "./InscriptionDialogContents";
import { InferredAppComponentsConfig } from "../../types";
import { CHAINS, TESTNETS_ENABLED } from "@/app/constants";
import abi from "../../../../../assets/abis/apps/inscriptions.json";

const SUPPORTED_CHAINS = new Set(CHAINS.map((chain) => chain.id));

export const INSCRIPTIONS_CONTRACT = {
  address: TESTNETS_ENABLED
    ? "0x00000000bddf795cc4a1b8107af795f434f705ed"
    : "0x00000000bddf795cc4a1b8107af795f434f705ed",
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
