import { getNftImages } from "@/app/utils";
import { createContext, useContext, useState } from "react";
import useAsyncEffect from "use-async-effect";
import { useReadContract } from "wagmi";
import { AppProviderProps } from "../../types";
import { NFT_GATED_CHAT_CONTRACT } from "./constants";

type AppContextType = {
  nftMsgSenderTokenIds: BigInt[] | undefined;
  nftMsgSenderImages: string[] | undefined;
};

const AppContext = createContext<AppContextType>({
  nftMsgSenderTokenIds: [],
  nftMsgSenderImages: [],
});

export const useNftGating = () => useContext(AppContext);

export default function NftGatingProvider(props: AppProviderProps) {
  const [nftMsgSenderImages, setNftMsgSenderImages] = useState<string[]>([]);

  const nftAddress = props.appContext.controlsState.nftAddress;

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
    <AppContext.Provider value={{ nftMsgSenderTokenIds, nftMsgSenderImages }}>
      {props.children}
    </AppContext.Provider>
  );
}
