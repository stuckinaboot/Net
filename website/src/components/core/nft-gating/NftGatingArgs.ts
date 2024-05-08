import { NFT_GATED_CHAT_CONTRACT, WILLIE_NET_CONTRACT } from "@/app/constants";
import { ReadonlyURLSearchParams } from "next/navigation";
import { NetAppConfig, MessageRange } from "../types";
import { ControlsState } from "./types";

type ContractReadArgs = {
  totalMessages: any;
  messages: (range: MessageRange) => any;
};

type ContractWriteArgs = {
  sendMessage: { abi: any; functionName: string; to: string; args: any[] };
};

export function getContractReadArgs(params: NetAppConfig): ContractReadArgs {
  return {
    totalMessages: {
      abi: WILLIE_NET_CONTRACT.abi,
      address: WILLIE_NET_CONTRACT.address as any,
      functionName: "getTotalMessagesForAppTopicCount",
      query: {
        refetchInterval: 2000,
      },
      args: [params.appAddress, params.controlsState.nftAddress],
    },
    messages: (range: MessageRange) => ({
      abi: WILLIE_NET_CONTRACT.abi,
      address: WILLIE_NET_CONTRACT.address as any,
      functionName: "getMessagesInRangeForAppTopic",
      args: [
        BigInt(range.startIndex),
        BigInt(range.endIndex),
        params.appAddress,
        params.controlsState.nftAddress,
      ],
    }),
  };
}

export function getContractWriteArgs(params: {
  appConfig: NetAppConfig;
  messageText: string;
}): ContractWriteArgs {
  return {
    sendMessage: {
      functionName: "sendMessage",
      abi: NFT_GATED_CHAT_CONTRACT.abi,
      to: NFT_GATED_CHAT_CONTRACT.address,
      args: [
        params.appConfig.controlsState.nftAddress,
        params.appConfig.controlsState.selectedNftTokenId,
        params.messageText,
      ],
    },
  };
}
