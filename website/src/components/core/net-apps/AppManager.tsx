import { AppComponentsConfig } from "../types";
import { config as NftGatingAppConfig } from "./nft-gating/NftGatingAppConfig";
import { NFT_GATED_CHAT_CONTRACT } from "./nft-gating/constants";

export const APP_TO_CONFIG: { [address: string]: AppComponentsConfig } = {
  [NFT_GATED_CHAT_CONTRACT.address]: NftGatingAppConfig,
};
