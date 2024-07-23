import { base, baseSepolia, degen } from "viem/chains";
import { InferredAppComponentsConfig } from "../../types";
import { SwapsDialogContents } from "./SwapsDialogContents";
import { parseMessageToSwap } from "./utils";
import {
  MAINNET_RELAY_API,
  TESTNET_RELAY_API,
  convertViemChainToRelayChain,
  createClient,
} from "@reservoir0x/relay-sdk";
import {
  HAM_CHAIN,
  TESTNETS_ENABLED,
  WILLIE_NET_CONTRACT,
} from "@/app/constants";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import { DINOS_CONTRACT } from "../dinos/constants";
import { chainIdToChain } from "@/app/utils";
import dinosProxyMinterAbi from "../../../../../assets/abis/apps/dinos-proxy-minter.json";

const SUPPORTED_CHAINS = [base, baseSepolia];
const SUPPORTED_CHAIN_IDS = new Set(SUPPORTED_CHAINS.map((chain) => chain.id));

const relayClient = createClient({
  baseApiUrl: TESTNETS_ENABLED ? TESTNET_RELAY_API : MAINNET_RELAY_API,
  source: "Net",
  chains: SUPPORTED_CHAINS.map((viemChain) =>
    convertViemChainToRelayChain(viemChain)
  ),
});

export const config: InferredAppComponentsConfig = {
  supportedChains: SUPPORTED_CHAIN_IDS,
  infer: (message: string) => parseMessageToSwap(message) != null,
  dialogContents: SwapsDialogContents,
  transactionExecutor: {
    customExecutor: async ({ message, wallet }) => {
      const swap = parseMessageToSwap(message);
      if (swap == null) {
        // Should not ever occur because infer should only result in the executor
        // getting hit if swap is non-null
        throw Error("Swap is null");
      }
      const userAddress = wallet.account?.address;
      if (userAddress == null) {
        throw Error("User address is null");
      }
      const calldata = encodeFunctionData({
        abi: WILLIE_NET_CONTRACT.abi,
        functionName: "sendMessageViaApp",
        args: [userAddress, message, "", ""],
      });
      return new Promise(async (resolve) => {
        const chain = chainIdToChain(HAM_CHAIN.id);
        if (chain == null) {
          return;
        }
        const txs = [
          {
            // Dinos proxy minter address on ham
            address: "0x00000000Ac8bbBDbF685c8D6750666480674cC1d" as any,
            abi: dinosProxyMinterAbi as any,
            functionName: "mintTo",
            args: [wallet.account?.address, "1"],
            value: parseEther(".001"),
            chain: chain,
            account: wallet.account?.address as any,
          },
        ];
        const quote = await relayClient.actions.getCallQuote({
          chainId: base.id,
          toChainId: HAM_CHAIN.id,
          txs,
          wallet,
        });
        const execute = await relayClient.actions.call({
          chainId: base.id,
          toChainId: HAM_CHAIN.id,
          wallet,
          txs,
        });
        // await relayClient.actions.swap({
        //   chainId: TESTNETS_ENABLED ? baseSepolia.id : base.id,
        //   wallet: wallet,
        //   txs: [
        //     {
        //       to: WILLIE_NET_CONTRACT.address,
        //       data: calldata,
        //       value: "0",
        //     },
        //   ],
        //   toChainId: base.id,
        //   currency: swap.from.currency.address,
        //   // Amount in wei to swap
        //   amount: swap.from.amount,
        //   toCurrency: swap.to.currency.address,
        //   onProgress: ({
        //     steps,
        //     currentStep,
        //     currentStepItem,
        //     txHashes,
        //     details,
        //   }) => {
        //     console.log(steps, currentStep, currentStepItem, details, txHashes);
        //     if (txHashes != null && txHashes.length > 0) {
        //       resolve(txHashes[0].txHash);
        //     }
        //   },
        // });
      });
    },
  },
  toasts: {
    success: { description: "You successfully swapped on Net" },
  },
};
