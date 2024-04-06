import { useState } from "react";
import NftSelectorDropdown, { NftSelectorItem } from "./NftSelectorDropdown";
import useAsyncEffect from "use-async-effect";
import { getNftImages, getOwnedNftTokenIds } from "@/app/utils";

export default function NftSelector(props: {
  userAddress: string;
  contractAddress: string;
  selectedTokenId: string | undefined;
  onTokenIdClicked: (tokenId: string) => void;
}) {
  const [nfts, setNfts] = useState<NftSelectorItem[]>([]);
  const [loadingNfts, setLoadingNfts] = useState(false);

  useAsyncEffect(async () => {
    setLoadingNfts(true);
    const ownedTokenIds = await getOwnedNftTokenIds({
      userAddress: props.userAddress,
      contractAddress: props.contractAddress,
    });
    const images = await getNftImages({
      contractAddress: props.contractAddress,
      tokenIds: ownedTokenIds,
    });
    const items = ownedTokenIds
      .map((tokenId, idx) => ({
        tokenId,
        imgSrc: images[idx],
      }))
      .filter((item) => item.imgSrc != null) as NftSelectorItem[];
    setNfts(items);
    setLoadingNfts(false);
    if (props.selectedTokenId == null && items.length > 0) {
      // Click on first token id to simulate it being selected when nfts are loaded
      props.onTokenIdClicked(items[0].tokenId);
    }
  }, [props.contractAddress, props.userAddress]);

  const selectedNft =
    props.selectedTokenId == null
      ? nfts[0]
      : nfts.find((nft) => nft.tokenId === props.selectedTokenId) || nfts[0];

  return loadingNfts ? (
    "Loading your NFTs..."
  ) : nfts.length === 0 ? (
    "We did not find any NFTs you own in this collection"
  ) : (
    <NftSelectorDropdown
      items={nfts}
      selectedItem={selectedNft}
      onItemClicked={(nft) => props.onTokenIdClicked(nft.tokenId)}
    />
  );
}
