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
import { TESTNETS_ENABLED, WILLIE_NET_CONTRACT } from "@/app/constants";
import { encodeFunctionData, formatEther } from "viem";

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
      await relayClient.actions.swap({
        chainId: base.id, //This is not required as the call action will use the active configured chain
        wallet: wallet,
        txs: [
          {
            to: WILLIE_NET_CONTRACT.address,
            data: calldata,
            value: "0",
          },
        ],
        toChainId: base.id,
        currency: swap.from.currency.address,
        // Amount in wei to swap
        amount: swap.from.amount,
        toCurrency: swap.to.currency.address,
        onProgress: ({
          steps,
          currentStep,
          currentStepItem,
          txHashes,
          details,
        }) => {
          console.log(steps, currentStep, currentStepItem, details, txHashes);
        },
      });
    },
  },
  toasts: {
    success: { description: "You successfully inscribed an NFT on Net" },
  },
};
