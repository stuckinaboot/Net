import { useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import {
  NFT_GATED_CHAT_CONTRACT,
  WILLIE_NET_CONTRACT,
} from "../../app/constants";
import truncateEthAddress from "truncate-eth-address";
import { cn } from "@/lib/utils";
import TimeAgo from "react-timeago";
import { chainTimeToMilliseconds, getOwnedNftTokenIds } from "@/app/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SendMessageSection from "./SendMessageSection";
import { Separator } from "@/components/ui/separator";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isAddress } from "viem";
import useAsyncEffect from "use-async-effect";

type OnchainMessage = {
  extraData: string;
  message: string;
  sender: string;
  app: string;
  timestamp: BigInt;
  topic: string;
};

export default function OnchainMessages(props: { nftAddress?: string }) {
  const { isConnected, address: userAddress } = useAccount();
  const [ownedNftTokenIds, setOwnedNftTokenIds] = useState([]);

  const isValidNftAddress = props.nftAddress
    ? isAddress(props.nftAddress)
    : false;

  const totalMessagesResult = props.nftAddress
    ? useReadContract({
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getTotalMessagesForAppTopicCount",
        query: {
          refetchInterval: 2000,
        },
        args: [NFT_GATED_CHAT_CONTRACT.address, props.nftAddress],
      })
    : useReadContract({
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getTotalMessagesCount",
        query: {
          refetchInterval: 2000,
        },
      });
  const messagesResult = props.nftAddress
    ? useReadContract({
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getMessagesInRangeForAppTopic",
        args: [
          BigInt(0),
          totalMessagesResult.data,
          NFT_GATED_CHAT_CONTRACT.address,
          props.nftAddress,
        ],
      })
    : useReadContract({
        abi: WILLIE_NET_CONTRACT.abi,
        address: WILLIE_NET_CONTRACT.address as any,
        functionName: "getMessagesInRange",
        args: [BigInt(0), totalMessagesResult.data],
      });
  const onchainMessages =
    (messagesResult.data as OnchainMessage[] | undefined) || [];
  const sanitizedOnchainMessages = onchainMessages.map((message) => ({
    ...message,
    sender: truncateEthAddress(message.sender),
    timestamp: +message.timestamp.toString(),
  }));

  const nftMsgSendersResult = isValidNftAddress
    ? useReadContract({
        abi: NFT_GATED_CHAT_CONTRACT.abi,
        address: NFT_GATED_CHAT_CONTRACT.address as any,
        functionName: "getMessageSendersInRange",
        args: [props.nftAddress, BigInt(0), totalMessagesResult.data],
      })
    : undefined;
  console.log("HIT!", nftMsgSendersResult, NFT_GATED_CHAT_CONTRACT, [
    props.nftAddress,
    BigInt(0),
    totalMessagesResult.data,
  ]);
  const nftMsgSenderTokenIds = nftMsgSendersResult?.data as
    | number[]
    | undefined;

  useAsyncEffect(async () => {
    if (props.nftAddress == null || !isConnected) {
      return;
    }
    const tokenIds = await getOwnedNftTokenIds({
      userAddress: userAddress as string,
      contractAddress: props.nftAddress,
    });
    setOwnedNftTokenIds(tokenIds);
  }, [isConnected]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col">
        <div className="flex flex-row justify-between">
          <CardTitle>
            {isValidNftAddress ? `WillieNet: ${props.nftAddress}` : "WillieNet"}
          </CardTitle>
          <ConnectButton />
        </div>
        <CardDescription>
          All messages are stored and read onchain and are publicly accessible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "whitespace-break-spaces",
            "font-mono",
            "max-h-60 overflow-y-auto",
            "w-full"
          )}
        >
          {sanitizedOnchainMessages.map((message, idx) => (
            <div key={idx}>
              <p className="text-left">{message.message}</p>
              <p className="text-right">
                <TimeAgo date={chainTimeToMilliseconds(message.timestamp)} /> |{" "}
                {message.sender}{" "}
                {nftMsgSenderTokenIds != null
                  ? `Token #${nftMsgSenderTokenIds[idx].toString()}`
                  : ""}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Separator className="m-3" />
        {isValidNftAddress &&
        props.nftAddress &&
        ownedNftTokenIds.length > 0 ? (
          <SendMessageSection
            nft={{ address: props.nftAddress, tokenId: ownedNftTokenIds[0] }}
          />
        ) : !isValidNftAddress ? (
          <SendMessageSection />
        ) : (
          <p>No NFTs owned in {props.nftAddress}</p>
        )}
      </CardFooter>
    </Card>
  );
}
