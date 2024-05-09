import { AppComponentsConfig } from "../../types";
import { getContractReadArgs, getContractWriteArgs } from "./NftGatingArgs";
import NftGatingControls from "./NftGatingControls";
import NftGatingMessageRenderer from "./NftGatingMessageRenderer";
import NftGatingProvider from "./NftGatingProvider";

export const config: AppComponentsConfig = {
  provider: NftGatingProvider,
  controls: NftGatingControls,
  messageRenderer: NftGatingMessageRenderer,
  getContractReadArgsFunction: getContractReadArgs,
  getContractWriteArgsFunction: getContractWriteArgs,
};
