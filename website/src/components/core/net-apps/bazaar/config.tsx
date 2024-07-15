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
import { CHAINS, HAM_CHAIN } from "@/app/constants";
import { baseSepolia } from "viem/chains";
import { ListDialogContents } from "./ListDialogContents";
import { convertMessageToListingComponents } from "./utils";
import { BAZAAR_CONTRACT } from "./constants";
import { WalletClient } from "viem";
import { Seaport } from "@opensea/seaport-js";
import { ethers } from "ethers";
import { ItemType } from "@opensea/seaport-js/lib/constants";

export const standaloneConfig: StandaloneAppComponentsConfig = {
  getTransformedMessage: async (chainId, messageText) => {
    try {
      const hashTagIndex = messageText.indexOf("#");
      if (hashTagIndex === -1) {
        return messageText;
      }
      const chain = chainIdToChain(chainId);
      if (chain == null) {
        return undefined;
      }
      // const uri = (await readContract(publicClient(chain), {
      //   address: INSCRIBED_DROPS_CONTRACT.address as any,
      //   abi: INSCRIBED_DROPS_CONTRACT.abi,
      //   functionName: "tokenURI",
      //   args: [dropId],
      // })) as any;
      return "hello";
    } catch (e) {
      // This may throw due to RPC errors or the contract not implementing the above function.
      // In either case, gracefully return undefined
      return messageText;
    }
  },
};

export const inferredAppConfig: InferredAppComponentsConfig = {
  supportedChains: new Set(
    CHAINS.filter(
      (chain) => chain.name === "Ham" || chain.name === "Base Sepolia"
    ).map((chain) => chain.id)
  ),
  infer: (message: string, chainId: number) =>
    convertMessageToListingComponents(message, chainId) != null,
  dialogContents: ListDialogContents,
  transactionExecutor: {
    customExecutor: async (params: {
      message: string;
      chainId: number;
      wallet: WalletClient;
    }) => {
      // Generate listing
      const listing = convertMessageToListingComponents(
        params.message,
        params.chainId
      );
      if (listing == null) {
        throw Error(
          "Inferred bazaar app error, should not have reached listing execution"
        );
      }

      // Create order with seaport
      // const provider = new ethers.JsonRpcProvider(getRpcUrl(params.chainId));

      const { account, chain, transport } = params.wallet;
      const network = {
        chainId: chain?.id,
        name: chain?.name,
        ensAddress: chain?.contracts?.ensRegistry?.address,
      };
      console.log("WTF", network);
      const provider = new BrowserProvider(transport, params.chainId);
      console.log("OOF");
      // const signer = new JsonRpcSigner(provider, account?.address as string);

      // TODO see if this works
      const seaport = new Seaport(provider as any);

      console.log("WOAH!", params.wallet.account?.address);
      try {
        const { executeAllActions } = await seaport.createOrder(
          {
            offer: [
              {
                itemType: ItemType.ERC721,
                token: listing.item.address,
                identifier: listing.item.tokenId,
              },
            ],
            consideration: [
              // TODO ensure this is right
              {
                amount: ethers.parseEther(listing.price.toString()).toString(),
                recipient: params.wallet.account?.address,
              },
            ],
          },
          params.wallet.account?.address
        );
        console.log("WOAH!", params.wallet.account?.address);
        const order = await executeAllActions();

        // TODO include order on Net
        return "todo";
      } catch (e) {
        console.log("WTF", e);
        throw e;
      }
    },
  },
  toasts: {
    success: { description: "You successfully inscribed an NFT on Net" },
  },
};
