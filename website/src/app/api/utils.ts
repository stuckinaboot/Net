import { TESTNETS_ENABLED } from "@/app/constants";
import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: TESTNETS_ENABLED
    ? process.env["NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_ID"]
    : process.env["NEXT_PUBLIC_ALCHEMY_BASE_ID"],
  network: TESTNETS_ENABLED ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};

export const alchemy = new Alchemy(settings);
