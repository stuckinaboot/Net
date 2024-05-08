import { NFT_GATED_CHAT_CONTRACT, WILLIE_NET_CONTRACT } from "@/app/constants";
import {
  NetAppContext,
  MessageRange,
  GetContractReadArgsFunction,
  GetContractWriteArgsFunction,
} from "../../types";

export const getContractReadArgs: GetContractReadArgsFunction = (params) => {
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
};

export const getContractWriteArgs: GetContractWriteArgsFunction = (params) => {
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
};
