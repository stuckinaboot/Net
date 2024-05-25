import MetadataAnimationPreview from "@/components/MetadataAnimationPreview";
import MetadataImagePreview from "@/components/MetadataImagePreview";
import { Spacing, SpacingSize } from "@/components/core/Spacing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InscribedDrop, getInscribedDropUrlForTokenId } from "../utils";
import { formatEther, parseUnits } from "viem";
import { INSCRIBED_DROPS_CONTRACT } from "../constants";
import { useReadContract } from "wagmi";
import { getEnsName } from "@/components/utils/utils";

// TODO preview on NFT storage

export type InscribeDropMessageTextTyped = {
  name?: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  traits?: any;
};

export default function InscribeDropMintPreview(props: {
  previewParams: {
    inscribedDrop: InscribedDrop;
    creator: string;
    tokenId: string;
    chainId: number;
  };
}) {
  const { data: totalSupplyData } = useReadContract({
    address: INSCRIBED_DROPS_CONTRACT.address as any,
    abi: INSCRIBED_DROPS_CONTRACT.abi,
    functionName: "totalSupply",
    args: [BigInt(props.previewParams.tokenId)],
  });
  const totalSupply =
    totalSupplyData != null ? +(totalSupplyData as BigInt).toString() : null;

  const metadata = props.previewParams.inscribedDrop.metadata;
  const mintConfig = props.previewParams.inscribedDrop.mintConfig;

  function LabelWithSpacing(props: { children: React.ReactNode }) {
    return (
      <>
        <Label>{props.children}</Label>
        <Spacing size={SpacingSize.SMALL} />
      </>
    );
  }

  return (
    <>
      {metadata.name && (
        <>
          <Label>Inscribed Drop: {metadata.name}</Label>{" "}
          <Button
            variant="outline"
            onClick={() =>
              window.open(
                getInscribedDropUrlForTokenId(
                  props.previewParams.tokenId,
                  props.previewParams.chainId
                ),
                "_blank"
              )
            }
          >
            View on OpenSea
          </Button>
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {props.previewParams.creator && (
        <>
          <Label>Created by: {props.previewParams.creator}</Label>
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {metadata.description && (
        <>
          <Label>Description: {metadata.description}</Label>
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {metadata.traits && (
        <>
          <Label>Traits: {metadata.traits}</Label>
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {metadata.image && (
        <>
          <Label>Image: </Label>
          <MetadataImagePreview image={metadata.image} />
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {metadata.animationUrl && (
        <>
          <Label>Animation: </Label>
          <MetadataAnimationPreview animationUrl={metadata.animationUrl} />
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      <LabelWithSpacing>
        Max supply: {mintConfig.maxSupply || "Open Edition"}
      </LabelWithSpacing>
      {totalSupply && (
        <LabelWithSpacing>Total minted: {totalSupply as any}</LabelWithSpacing>
      )}
      <LabelWithSpacing>
        Mint price (in ETH): {mintConfig.priceInEth}
      </LabelWithSpacing>
      <LabelWithSpacing>
        Mint end timestamp (in block time):{" "}
        {mintConfig.mintEndTimestamp || "Open Forever"}
      </LabelWithSpacing>
    </>
  );
}
