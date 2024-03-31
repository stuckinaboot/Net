import { useState } from "react";
import { useAccount } from "wagmi";
import { getOwnedNftTokenIds } from "@/app/utils";
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
import MessagesDisplay from "./MessagesDisplay";

export default function OnchainMessages(props: { nftAddress?: string }) {
  const { isConnected, address: userAddress } = useAccount();
  const [ownedNftTokenIds, setOwnedNftTokenIds] = useState([]);

  const isValidNftAddress = props.nftAddress
    ? isAddress(props.nftAddress)
    : false;

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
    <Card className="w-full h-full flex flex-col">
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
      <CardContent className="flex-1 flex-col">
        <MessagesDisplay nftAddress={props.nftAddress} />
      </CardContent>
      <CardFooter className="flex flex-col justify-end">
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
