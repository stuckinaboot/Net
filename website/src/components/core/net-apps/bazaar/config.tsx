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
import { CHAINS } from "@/app/constants";
import { ListDialogContents } from "./ListDialogContents";
import {
  NFT_ADDRESS_NAME_MAPPING,
  convertMessageToListingComponents,
  getDefaultCurrencySymbolForChain,
  getTimestampInSecondsNHoursFromNow,
} from "./utils";
import {
  BAZAAR_CONTRACT,
  BAZAAR_SUBMISSION_ABI,
  ERC721_TOKEN_URI_ABI,
  FEE_ADDRESS,
  FEE_BPS,
} from "./constants";
import { WalletClient, parseEther } from "viem";
import { Seaport } from "@opensea/seaport-js";
import { ethers } from "ethers";
import { ItemType } from "@opensea/seaport-js/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { decodeAbiParameters } from "viem";
import { useReadContract } from "wagmi";
import MetadataImagePreview from "@/components/MetadataImagePreview";

enum SeaportOrderStatus {
  CANCELLED,
  EXPIRED,
  OPEN,
  FILLED,
}

export const standaloneConfig: StandaloneAppComponentsConfig = {
  getTransformedMessage: async (chainId, messageText, messageData, wallet) => {
    try {
      const [possibleOrder]: any[] = decodeAbiParameters(
        BAZAAR_SUBMISSION_ABI,
        messageData as any
      );

      // Attempt to parse message as a seaport order
      if (possibleOrder.parameters == null) {
        return messageText;
      }
      if (possibleOrder.counter == null) {
        return messageText;
      }
      if (possibleOrder.signature == null) {
        return messageText;
      }

      let providerOrSigner;

      if (wallet != null) {
        const { account, chain, transport } = wallet;

        const provider = new BrowserProvider(transport, chainId);
        const signer = new JsonRpcSigner(provider, account?.address as string);
        providerOrSigner = signer;
      } else {
        const chain = chainIdToChain(chainId);
        if (chain == null) {
          return messageText;
        }
        const provider = new ethers.JsonRpcProvider(
          publicClient(chain).transport.url
        );
        providerOrSigner = provider;
      }
      // const provider = new ethers.BrowserProvider(window.ethereum);
      const seaport = new Seaport(providerOrSigner as any);
      const orderHash = seaport.getOrderHash({
        ...possibleOrder.parameters,
        counter: possibleOrder.counter,
      } as any);

      // Determine order status
      let orderStatus = SeaportOrderStatus.OPEN;
      const onchainOrderStatus = await seaport.getOrderStatus(orderHash);
      if (onchainOrderStatus.isCancelled) {
        orderStatus = SeaportOrderStatus.CANCELLED;
      } else if (
        onchainOrderStatus.totalFilled.toString() ===
          onchainOrderStatus.totalSize.toString() &&
        // Likely not need but just sanity check
        parseInt(onchainOrderStatus.totalFilled.toString()) !== 0
      ) {
        orderStatus = SeaportOrderStatus.FILLED;
      } else if (
        parseInt(possibleOrder.parameters.endTime.toString()) * 1000 <
        Date.now()
      ) {
        orderStatus = SeaportOrderStatus.EXPIRED;
      }

      const chainVal = chainIdToChain(chainId);
      if (chainVal == null) {
        throw Error("Chain not found");
      }

      // Fetch NFT media
      const tokenURI = (await readContract(publicClient(chainVal), {
        address: possibleOrder.parameters.offer[0].token as any,
        abi: ERC721_TOKEN_URI_ABI,
        functionName: "tokenURI",
        args: [possibleOrder.parameters.offer[0].identifierOrCriteria],
      })) as any;
      const res = await fetch("/api/getTokenMetadataFromTokenURI", {
        method: "POST",
        body: JSON.stringify({ tokenURI }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const metadata = (await res.json())?.metadata;
      // ham punks uses image_data
      const image = metadata?.image || metadata?.image_data;

      const imgComponent =
        image != null ? (
          <MetadataImagePreview image={image} size="w-32" />
        ) : (
          <i>No image found</i>
        );

      // Sanitize text
      let sanitizedMessageText = messageText;

      // Replace address with name of collection
      Object.entries(NFT_ADDRESS_NAME_MAPPING).forEach(([address, name]) => {
        sanitizedMessageText = sanitizedMessageText.replace(
          address.toLowerCase(),
          name
        );
      });

      // Replace expiration time with human readable time
      sanitizedMessageText = sanitizedMessageText.replace(
        possibleOrder.parameters.endTime.toString(),
        new Date(
          parseInt(possibleOrder.parameters.endTime.toString()) * 1000
        ).toLocaleString()
      );
      sanitizedMessageText = sanitizedMessageText.replace(
        "\nExpiration Date",
        ` ${getDefaultCurrencySymbolForChain(chainId)}\nExpiration Date`
      );

      return (
        <div>
          <div className="flex space-x-2 flex-wrap">
            {sanitizedMessageText}{" "}
            <Button
              disabled={
                wallet == null || orderStatus !== SeaportOrderStatus.OPEN
              }
              onClick={async () => {
                if (wallet?.chain?.id !== chainVal.id) {
                  toast({
                    title: "Error",
                    description: "You must be on Ham to use this feature.",
                  });
                  return;
                }
                try {
                  let finalSubmission = {
                    parameters: {
                      ...possibleOrder.parameters,
                      // Sanitize identifier or criterias to strings to get around a lowercasing check in seaportjs
                      offer: possibleOrder.parameters.offer.map(
                        (offer: any) => ({
                          ...offer,
                          identifierOrCriteria:
                            offer.identifierOrCriteria.toString(),
                        })
                      ),
                      consideration: possibleOrder.parameters.consideration.map(
                        (consideration: any) => ({
                          ...consideration,
                          identifierOrCriteria:
                            consideration.identifierOrCriteria.toString(),
                        })
                      ),
                      counter: possibleOrder.counter,
                    },
                    signature: possibleOrder.signature,
                  };

                  const {
                    actions,
                    executeAllActions: executeAllFulfillActions,
                  } = await seaport.fulfillOrder({
                    // order: possibleOrder as any,
                    order: finalSubmission as any,
                    accountAddress: wallet.account?.address,
                  });

                  const transaction = await executeAllFulfillActions();
                  toast({
                    title: "Submitted buy transaction",
                    description: "Transaction submitted to fulfill order.",
                  });
                  // console.log(
                  //   "actions",
                  //   await actions[0].transactionMethods.buildTransaction()
                  // );
                } catch (e: any) {
                  console.log("Error on fill", e);
                  toast({
                    title: "Fill failed",
                    description: <>{e?.message}</>,
                  });
                }
              }}
            >
              {orderStatus === SeaportOrderStatus.OPEN
                ? "Buy now"
                : orderStatus === SeaportOrderStatus.CANCELLED
                ? "Cancelled"
                : orderStatus === SeaportOrderStatus.EXPIRED
                ? "Expired"
                : orderStatus === SeaportOrderStatus.FILLED
                ? "Filled"
                : "Unknown"}
            </Button>
          </div>{" "}
          {imgComponent}
        </div>
      );
    } catch (e) {
      console.log("ERROR", e);
      // This may throw due to RPC errors or the contract not implementing the above function.
      // In either case, gracefully return undefined
      return messageText;
    }
  },
};

export const inferredAppConfig: InferredAppComponentsConfig = {
  supportedChains: new Set(
    CHAINS.filter(
      (chain) =>
        chain.name === "Ham" ||
        chain.name === "Base Sepolia" ||
        chain.name === "Base" ||
        chain.name === "Degen"
    ).map((chain) => chain.id)
  ),
  infer: (message: string, chainId: number) =>
    convertMessageToListingComponents(message, chainId) != null,
  dialogContents: ListDialogContents,
  transactionExecutor: {
    parameters: (message: string) => ({
      abi: BAZAAR_CONTRACT.abi,
      args: [message],
      functionName: "submit",
    }),
    preProcessArgs: async (params: {
      args: any[];
      chainId: number;
      wallet: WalletClient;
    }) => {
      // Generate listing
      const listing = convertMessageToListingComponents(
        // Message
        params.args[0],
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
        // TODO should this be updated
        ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", // chain?.contracts?.ensRegistry?.address,
      };
      const provider = new BrowserProvider(transport, params.chainId);
      const signer = new JsonRpcSigner(provider, account?.address as string);

      // const provider = new ethers.BrowserProvider(window.ethereum);
      const seaport = new Seaport(signer as any);

      const orderEndTime = getTimestampInSecondsNHoursFromNow(24).toString();
      const listingPriceInWei = parseEther(listing.price.toString());
      const feeInWei = (listingPriceInWei * BigInt(FEE_BPS)) / BigInt(10_000);
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
            {
              amount: (listingPriceInWei - feeInWei).toString(),
              recipient: params.wallet.account?.address,
            },
            {
              amount: feeInWei.toString(),
              recipient: FEE_ADDRESS,
            },
          ],
          endTime: orderEndTime,
        },
        params.wallet.account?.address
      );
      const order = await executeAllActions();

      // Parameters includes counter (despite the naming)
      const finalSubmission = {
        parameters: order.parameters,
        counter: order.parameters.counter,
        signature: order.signature,
      };
      return [finalSubmission, ...params.args.slice(1)];
    },
  },
  toasts: {
    success: { description: "You successfully submitted a listing on Net" },
  },
};
