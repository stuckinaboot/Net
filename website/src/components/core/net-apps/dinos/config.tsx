import { BrowserProvider, JsonRpcProvider, JsonRpcSigner } from "ethers";
import {
  chainIdToChain,
  chainIdToChainString,
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
import {
  DINOS_CONTRACT,
  DINO_PRICE_IN_ETH,
  MINT_AMOUNTS,
  MINT_TOASTS,
} from "./constants";
import { ERC721_TOKEN_URI_ABI } from "../bazaar/constants";

export const standaloneConfig: StandaloneAppComponentsConfig = {
  getTransformedMessage: async (chainId, messageText, messageData, wallet) => {
    if (messageText.startsWith("Transferred")) {
      return messageText;
    }

    const chain = chainIdToChain(chainId);
    if (chain == null) {
      return messageText;
    }

    // minted dinos #1 to #100
    const hashTagIndex = messageText.lastIndexOf("#");
    if (hashTagIndex === -1) {
      return messageText;
    }

    const firstTokenId = messageText.substring(hashTagIndex + 1);

    const tokenURI = (await readContract(publicClient(chain), {
      address: DINOS_CONTRACT.address as any,
      abi: ERC721_TOKEN_URI_ABI,
      functionName: "tokenURI",
      args: [firstTokenId],
    })) as any;
    const res = await fetch("/api/getTokenMetadataFromTokenURI", {
      method: "POST",
      body: JSON.stringify({ tokenURI }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const metadata = (await res.json())?.metadata;
    const image = metadata?.image;

    return (
      <div>
        <div>
          {messageText}
          <MetadataImagePreview image={image} size="w-8" />
        </div>
        <br />
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
              disabled={true}
            />
          ))}
        </div>
      </div>
    );
  },
};
