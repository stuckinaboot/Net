import {
  AppComponentsConfig,
  InferredAppComponentsConfig,
  StandaloneAppComponentsConfig,
} from "../types";
import { INSCRIPTIONS_CONTRACT } from "./inscriptions/InscriptionInferredAppConfig";
import { config as NftGatingAppConfig } from "./nft-gating/NftGatingAppConfig";
import { config as SwapsAppConfig } from "./swaps/SwapsInferredAppConfig";
import { config as InscriptionsAppConfig } from "./inscriptions/InscriptionInferredAppConfig";
import { config as InscribedDropConfig } from "./inscribed-drops/config";
import { standaloneConfig as BazaarStandaloneConfig } from "./bazaar/config";
import { inferredAppConfig as BazaarInferredConfig } from "./bazaar/config";
import { standaloneConfig as DinosStandaloneConfig } from "./dinos/config";
import { NFT_GATED_CHAT_CONTRACT } from "./nft-gating/constants";
import { INSCRIBED_DROPS_CONTRACT } from "./inscribed-drops/constants";
import { BAZAAR_CONTRACT } from "./bazaar/constants";
import { NULL_ADDRESS, WILLIE_NET_CONTRACT } from "@/app/constants";
import { DINOS_CONTRACT } from "./dinos/constants";

export const APP_TO_CONFIG: { [address: string]: AppComponentsConfig } = {
  [NFT_GATED_CHAT_CONTRACT.address]: NftGatingAppConfig,
};

export const INFERRED_APP_TO_CONFIG: {
  [address: string]: InferredAppComponentsConfig;
} = {
  [INSCRIPTIONS_CONTRACT.address]: InscriptionsAppConfig,
  [BAZAAR_CONTRACT.address]: BazaarInferredConfig,
  ["Swaps no address"]: SwapsAppConfig,
};

export const STANDALONE_APP_TO_CONFIG: {
  [address: string]: StandaloneAppComponentsConfig;
} = {
  // TODO make these addresses all lowercase and do lowercase
  // sanitization when querying them
  [INSCRIBED_DROPS_CONTRACT.address]: InscribedDropConfig,
  [BAZAAR_CONTRACT.address]: BazaarStandaloneConfig,
  [DINOS_CONTRACT.address]: DinosStandaloneConfig,
};
