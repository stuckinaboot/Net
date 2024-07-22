import { BrowserProvider, JsonRpcProvider, JsonRpcSigner } from "ethers";
import {
  chainIdToChain,
  chainIdToOpenSeaChainString,
  getRpcUrl,
  publicClient,
} from "@/app/utils";
import {
  InferredAppComponentsConfig,
  StandaloneAppComponentsConfig,
} from "../../types";
import { readContract } from "viem/actions";
import Link from "next/link";
import { CHAINS, HAM_CHAIN, WILLIE_NET_CONTRACT } from "@/app/constants";
import { baseSepolia } from "viem/chains";
import { WalletClient, parseEther } from "viem";
import { Seaport } from "@opensea/seaport-js";
import { ethers } from "ethers";
import { ItemType } from "@opensea/seaport-js/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { decodeAbiParameters } from "viem";
import { useReadContract } from "wagmi";
import MetadataImagePreview from "@/components/MetadataImagePreview";
import SubmitTransactionButton from "../../SubmitTransactionButton";
import { DINOS_CONTRACT } from "./constants";

const DINO_PRICE_IN_ETH = 0.001;

const MINT_TOASTS = {
  title: "dinos",
  success: "Successfully minted dinos",
  error: "Failed to mint dinos",
};

const MINT_AMOUNTS = [1, 5, 10, 20, 50];

export const standaloneConfig: StandaloneAppComponentsConfig = {
  getTransformedMessage: async (chainId, messageText, messageData, wallet) => {
    if (messageText.startsWith("Transferred")) {
      return messageText;
    }
    return (
      <div>
        <div>{messageText}</div>
        <div className="flex space-x-2 flex-wrap">
          {MINT_AMOUNTS.map((amt) => (
            <SubmitTransactionButton
              key={amt}
              functionName="mint"
              args={[amt]}
              abi={DINOS_CONTRACT.abi}
              to={DINOS_CONTRACT.address}
              messages={{
                toasts: MINT_TOASTS,
                button: {
                  default: `Mint ${amt}`,
                  pending: "Minting Dinos",
                  success: "Dinos Minted",
                },
              }}
              value={parseEther(
                (DINO_PRICE_IN_ETH * amt).toString()
              ).toString()}
            />
          ))}
        </div>
      </div>
    );
  },
};
