import {
  getClient,
  Execute,
  createClient,
  MAINNET_RELAY_API,
  convertViemChainToRelayChain,
  TESTNET_RELAY_API,
} from "@reservoir0x/relay-sdk";
import React, { useState } from "react";
import SendMessageButton from "./SendMessageButton";
import { Textarea } from "@/components/ui/textarea";
import { NetAppContext } from "./types";
import { Button } from "../ui/button";
import { createWalletClient, http } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { base, baseSepolia, mainnet, zora, zoraSepolia } from "viem/chains";
import { WILLIE_NET_CONTRACT } from "@/app/constants";
import { encodeAbiParameters } from "viem";
import { encodeFunctionData } from "viem";

const relayClient = createClient({
  baseApiUrl: MAINNET_RELAY_API,
  source: "relay-demo",
  chains: [
    convertViemChainToRelayChain(base),
    convertViemChainToRelayChain(zora),
    convertViemChainToRelayChain(baseSepolia),
    convertViemChainToRelayChain(zoraSepolia),
  ],
});

function getAppSendMessageDialog() {
  // TODO
}

export default function SendMessageSection(props: {
  appContext?: NetAppContext;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");
  const account = useAccount();
  const { data: wallet } = useWalletClient();

  return (
    <div className="flex flex-col items-center justify-between w-full">
      <Textarea
        placeholder="Enter message to send..."
        contentEditable
        onChange={(e) => {
          const txt = e.target.value;
          setMessage(txt);
        }}
        value={message}
        disabled={props.disabled}
      />
      <div className="m-1" />
      <Button
        onClick={() => {
          if (wallet == null) {
            return;
          }
          const calldata = encodeFunctionData({
            abi: WILLIE_NET_CONTRACT.abi,
            functionName: "sendMessage",
            args: ["Relay link what up", "", ""],
          });
          relayClient.actions.swap({
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
            currency: "0x0000000000000000000000000000000000000000",
            amount: "10000000000000", // Amount in wei to swap
            toCurrency: "0x4200000000000000000000000000000000000006",
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
            },
            depositGasLimit: "100000000",
            // options: { tradeType: "EXACT_OUTPUT" },
          });
        }}
      >
        foobar
      </Button>
      <SendMessageButton
        appContext={props.appContext}
        className="w-full"
        message={message}
        topic="default"
        onTransactionConfirmed={() => {
          setMessage("");
        }}
        disabled={props.disabled}
      />
    </div>
  );
}
