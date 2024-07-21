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
import { ListDialogContents } from "./ListDialogContents";
import { convertMessageToListingComponents } from "./utils";
import { BAZAAR_CONTRACT } from "./constants";
import { WalletClient } from "viem";
import { Seaport } from "@opensea/seaport-js";
import { ethers } from "ethers";
import { ItemType } from "@opensea/seaport-js/lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { decodeAbiParameters } from "viem";

export const standaloneConfig: StandaloneAppComponentsConfig = {
  getTransformedMessage: async (chainId, messageText, messageData, wallet) => {
    try {
      console.log("ATTEMPT!", messageData);
      const [possibleOrder] = decodeAbiParameters(
        [
          {
            name: "submission",
            type: "tuple",
            internalType: "struct BazaarV1.Submission",
            components: [
              {
                name: "parameters",
                type: "tuple",
                internalType: "struct OrderParameters",
                components: [
                  {
                    name: "offerer",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "zone",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "offer",
                    type: "tuple[]",
                    internalType: "struct OfferItem[]",
                    components: [
                      {
                        name: "itemType",
                        type: "uint8",
                        internalType: "enum ItemType",
                      },
                      {
                        name: "token",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "identifierOrCriteria",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "startAmount",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "endAmount",
                        type: "uint256",
                        internalType: "uint256",
                      },
                    ],
                  },
                  {
                    name: "consideration",
                    type: "tuple[]",
                    internalType: "struct ConsiderationItem[]",
                    components: [
                      {
                        name: "itemType",
                        type: "uint8",
                        internalType: "enum ItemType",
                      },
                      {
                        name: "token",
                        type: "address",
                        internalType: "address",
                      },
                      {
                        name: "identifierOrCriteria",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "startAmount",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "endAmount",
                        type: "uint256",
                        internalType: "uint256",
                      },
                      {
                        name: "recipient",
                        type: "address",
                        internalType: "address payable",
                      },
                    ],
                  },
                  {
                    name: "orderType",
                    type: "uint8",
                    internalType: "enum OrderType",
                  },
                  {
                    name: "startTime",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "endTime",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "zoneHash",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "salt",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "conduitKey",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "totalOriginalConsiderationItems",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
              { name: "counter", type: "uint256", internalType: "uint256" },
              { name: "signature", type: "bytes", internalType: "bytes" },
            ],
          },
        ],
        messageData as any
      );

      // Attempt to parse message as a seaport order
      console.log("HIT ME!!", possibleOrder);
      if (possibleOrder.parameters == null) {
        return messageText;
      }
      if (possibleOrder.counter == null) {
        return messageText;
      }
      if (possibleOrder.signature == null) {
        return messageText;
      }
      if (wallet == null) {
        // NOTE: this means users have to be connected to see the fill option
        return messageText;
      }

      const { account, chain, transport } = wallet;
      const network = {
        chainId: chain?.id,
        name: chain?.name,
        ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e", // chain?.contracts?.ensRegistry?.address,
      };
      console.log("WTF", network);
      const provider = new BrowserProvider(transport, chainId);
      console.log("OOF");
      const signer = new JsonRpcSigner(provider, account?.address as string);

      // const provider = new ethers.BrowserProvider(window.ethereum);
      const seaport = new Seaport(signer as any);

      console.log("REACH!");
      return (
        <div>
          {messageText}{" "}
          <Button
            onClick={async () => {
              try {
                let finalSubmission = {
                  parameters: {
                    ...possibleOrder.parameters,
                    // Sanitize identifier or criterias to strings to get around a lowercasing check in seaportjs
                    offer: possibleOrder.parameters.offer.map((offer) => ({
                      ...offer,
                      identifierOrCriteria:
                        offer.identifierOrCriteria.toString(),
                    })),
                    consideration: possibleOrder.parameters.consideration.map(
                      (consideration) => ({
                        ...consideration,
                        identifierOrCriteria:
                          consideration.identifierOrCriteria.toString(),
                      })
                    ),
                    counter: possibleOrder.counter,
                  },
                  signature: possibleOrder.signature,
                };

                console.log("SUBMISSION IS", finalSubmission);
                const { actions, executeAllActions: executeAllFulfillActions } =
                  await seaport.fulfillOrder({
                    // order: possibleOrder as any,
                    order: finalSubmission as any,
                    accountAddress: wallet.account?.address,
                  });

                const transaction = await executeAllFulfillActions();
                // console.log(
                //   "actions",
                //   await actions[0].transactionMethods.buildTransaction()
                // );
              } catch (e: any) {
                console.log("ERROR", e);
                toast({
                  title: "Fill failed",
                  description: <>{e?.message}</>,
                });
              }
            }}
          >
            Fill order
          </Button>
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
        chain.name === "Base"
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
      console.log("WTF", network);
      const provider = new BrowserProvider(transport, params.chainId);
      console.log("OOF");
      const signer = new JsonRpcSigner(provider, account?.address as string);

      // const provider = new ethers.BrowserProvider(window.ethereum);
      const seaport = new Seaport(signer as any);

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
              amount: ethers
                .parseEther((listing.price / 2).toString())
                .toString(),
              recipient: params.wallet.account?.address,
            },
            {
              amount: ethers
                .parseEther((listing.price / 2).toString())
                .toString(),
              recipient: params.wallet.account?.address,
            },
          ],
        },
        params.wallet.account?.address
      );
      const order = await executeAllActions();
      console.log("LFG", order);

      const orderString = JSON.stringify(order);
      // Parameters includes counter (despite the naming)
      const finalSubmission = {
        parameters: order.parameters,
        counter: order.parameters.counter,
        signature: order.signature,
      };
      // TODO consider if order string should be data rather than text
      return [finalSubmission, ...params.args.slice(1)];
    },
  },
  toasts: {
    success: { description: "You successfully submitted a listing on Net" },
  },
};
