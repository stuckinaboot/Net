import { AppComponentsConfig, InferredAppComponentsConfig } from "../types";
import { INSCRIPTIONS_CONTRACT } from "./inscriptions/InscriptionInferredAppConfig";
import { config as NftGatingAppConfig } from "./nft-gating/NftGatingAppConfig";
import { config as InscriptionsAppConfig } from "./inscriptions/InscriptionInferredAppConfig";
import { NFT_GATED_CHAT_CONTRACT } from "./nft-gating/constants";

export const APP_TO_CONFIG: { [address: string]: AppComponentsConfig } = {
  [NFT_GATED_CHAT_CONTRACT.address]: NftGatingAppConfig,
};

export const INFERRED_APP_TO_CONFIG: {
  [address: string]: InferredAppComponentsConfig;
} = {
  [INSCRIPTIONS_CONTRACT.address]: InscriptionsAppConfig,
};
