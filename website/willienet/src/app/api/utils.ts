import { testnetsEnabled } from "@/app/constants";
import { Alchemy, Network } from "alchemy-sdk";

const settings = {
  apiKey: testnetsEnabled
    ? process.env["NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_ID"]
    : process.env["NEXT_PUBLIC_ALCHEMY_BASE_ID"],
  network: testnetsEnabled ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};

export const alchemy = new Alchemy(settings);
