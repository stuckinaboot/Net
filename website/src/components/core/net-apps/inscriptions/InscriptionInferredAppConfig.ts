import { base, baseSepolia } from "viem/chains";
import { InscriptionDialogContents } from "./InscriptionDialogContents";
import { InferredAppComponentsConfig } from "../../types";
import { TESTNETS_ENABLED } from "@/app/constants";

const SUPPORTED_CHAINS = new Set([base.id, baseSepolia.id]);

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
    abi: [],
    args: [message],
    functionName: "inscribe",
  }),
};

export const INSCRIPTIONS_CONTRACT = {
  address: TESTNETS_ENABLED
    ? "0xbcdadbd75e30f645997ef94dd38ec6c1fb1c6ed1"
    : "0xabc",
  abi: [
    // TODO
  ],
};
