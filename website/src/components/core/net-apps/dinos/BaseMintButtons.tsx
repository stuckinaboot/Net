import { parseEther } from "viem";
import SubmitTransactionButton from "../../SubmitTransactionButton";
import {
  DINOS_CONTRACT,
  DINOS_PROXY_MINTER_CONTRACT,
  DINO_PRICE_IN_ETH,
  MINT_AMOUNTS,
  MINT_TOASTS,
} from "./constants";
import { Button } from "@/components/ui/button";
import { useWalletClient } from "wagmi";
import { toast } from "@/components/ui/use-toast";
import { base, baseSepolia } from "viem/chains";
import { HAM_CHAIN, TESTNETS_ENABLED } from "@/app/constants";
import {
  MAINNET_RELAY_API,
  TESTNET_RELAY_API,
  convertViemChainToRelayChain,
  createClient,
} from "@reservoir0x/relay-sdk";
import { useState } from "react";

const relayClient = createClient({
  baseApiUrl: TESTNETS_ENABLED ? TESTNET_RELAY_API : MAINNET_RELAY_API,
  source: "Net",
  chains: [base, baseSepolia, HAM_CHAIN].map((viemChain) =>
    convertViemChainToRelayChain(viemChain)
  ),
});

export default function BaseMintButtons() {
  const { data: wallet } = useWalletClient();
  const [isCurrentlyMintingAmt, setIsCurrentlyMintingAmt] = useState(0);

  return (
    <div className="flex space-x-2 flex-wrap">
      {MINT_AMOUNTS.map((amt) => (
        <Button
          key={amt}
          onClick={async () => {
            if (wallet == null) {
              toast({ title: "Error", description: "Wallet not connected" });
              return;
            }
            if (wallet.chain.id !== base.id) {
              toast({
                title: "Error",
                description: "You must be on Base to use these mint buttons.",
              });
              return;
            }
            const txs = [
              {
                // Dinos proxy minter address on ham
                address: DINOS_PROXY_MINTER_CONTRACT.address as any,
                abi: DINOS_PROXY_MINTER_CONTRACT.abi,
                functionName: "mintTo",
                args: [wallet.account?.address, amt],
                value: parseEther((DINO_PRICE_IN_ETH * amt).toString()),
                chain: HAM_CHAIN,
                account: wallet.account?.address as any,
              },
            ];
            setIsCurrentlyMintingAmt(amt);
            const quote = await relayClient.actions.getCallQuote({
              chainId: base.id,
              toChainId: HAM_CHAIN.id,
              txs,
              wallet,
            });
            const txHash = await new Promise(async (resolve) => {
              try {
                const execute = await relayClient.actions.call({
                  chainId: base.id,
                  toChainId: HAM_CHAIN.id,
                  wallet,
                  txs,
                  onProgress: ({
                    steps,
                    currentStep,
                    currentStepItem,
                    txHashes,
                    details,
                  }) => {
                    console.log(
                      steps,
                      currentStep,
                      currentStepItem,
                      details,
                      txHashes
                    );
                    if (txHashes != null && txHashes.length > 0) {
                      resolve(txHashes[0].txHash);
                    }
                  },
                });
              } catch (e) {
                setIsCurrentlyMintingAmt(0);
                return null;
              }
            });
            setIsCurrentlyMintingAmt(0);
          }}
        >
          {isCurrentlyMintingAmt === amt ? "Minting..." : `Mint ${amt}`}
        </Button>
      ))}
    </div>
  );
}
