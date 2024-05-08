import { NFT_GATED_CHAT_CONTRACT } from "@/app/constants";
import { getNftImages } from "@/app/utils";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useState } from "react";
import useAsyncEffect from "use-async-effect";
import { useReadContract } from "wagmi";

type ContextType = {
  nftMsgSenderTokenIds: BigInt[] | undefined;
  nftMsgSenderImages: string[] | undefined;
};

const MyContext = createContext<ContextType>({
  nftMsgSenderTokenIds: [],
  nftMsgSenderImages: [],
});

export const useNftGating = () => useContext(MyContext);

export default function NftGatingProvider(props: {
  children?: React.ReactNode;
  messageRange: { startIndex: number; endIndex: number };
}) {
  const [nftMsgSenderImages, setNftMsgSenderImages] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const nftAddress = searchParams.get("nftAddress");

  const nftMsgSendersResult = useReadContract({
    abi: NFT_GATED_CHAT_CONTRACT.abi,
    address: NFT_GATED_CHAT_CONTRACT.address as any,
    functionName: "getMessageSendersInRange",
    args: [
      nftAddress,
      BigInt(props.messageRange.startIndex),
      BigInt(props.messageRange.endIndex),
    ],
  });
  const nftMsgSenderTokenIds = nftMsgSendersResult?.data as
    | BigInt[]
    | undefined;

  useAsyncEffect(async () => {
    if (nftAddress == null || nftMsgSenderTokenIds == null) {
      return;
    }
    const images = await getNftImages({
      contractAddress: nftAddress,
      tokenIds: nftMsgSenderTokenIds.map((tokenId) => tokenId.toString()),
    });
    setNftMsgSenderImages(images);
  }, [nftMsgSenderTokenIds?.length]);

  return (
    <MyContext.Provider value={{ nftMsgSenderTokenIds, nftMsgSenderImages }}>
      {props.children}
    </MyContext.Provider>
  );
}
