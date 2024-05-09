import { AppComponentsConfig } from "../types";
import { config as NftGatingAppConfig } from "./nft-gating/NftGatingAppConfig";

export const APP_TO_CONFIG: { [address: string]: AppComponentsConfig } = {
  "0x3d9d7f4646028847c84539855e2d8d63ebe11991": NftGatingAppConfig,
};
