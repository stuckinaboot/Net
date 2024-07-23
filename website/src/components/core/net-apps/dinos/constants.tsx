import abi from "../../../../../assets/abis/apps/dinos.json";
import dinosProxyMinterAbi from "../../../../../assets/abis/apps/dinos-proxy-minter.json";

export const DINOS_CONTRACT = {
  abi,
  address: "0xAbCdefC26dAc279770D07eE513668b5aB74718e3",
};

export const DINOS_PROXY_MINTER_CONTRACT = {
  abi: dinosProxyMinterAbi,
  address: "0x00000000Ac8bbBDbF685c8D6750666480674cC1d",
};

export const DINO_PRICE_IN_ETH = 0.001;

export const MINT_TOASTS = {
  title: "dinos",
  success: "Successfully minted dinos",
  error: "Failed to mint dinos",
};

export const MINT_AMOUNTS = [1, 5, 10, 20, 50];
