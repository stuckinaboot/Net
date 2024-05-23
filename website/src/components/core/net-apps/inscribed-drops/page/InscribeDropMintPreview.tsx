import MetadataAnimationPreview from "@/components/MetadataAnimationPreview";
import MetadataImagePreview from "@/components/MetadataImagePreview";
import { Spacing } from "@/components/core/Spacing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InscribedDrop, getInscribedDropUrlForTokenId } from "../utils";

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
  const metadata = props.previewParams.inscribedDrop.metadata;
  const mintConfig = props.previewParams.inscribedDrop.mintConfig;

  function LabelWithSpacing(props: { children: React.ReactNode }) {
    return (
      <>
        <Label>{props.children}</Label>
        <Spacing />
      </>
    );
  }

  return (
    <>
      {metadata.name && (
        <>
          <Label>Inscribed Drop: {metadata.name}</Label>
          <Spacing />
        </>
      )}
      {props.previewParams.creator && (
        <>
          <Label>Created by: {props.previewParams.creator}</Label>
          <Spacing />
        </>
      )}
      {metadata.description && (
        <>
          <Label>Description: {metadata.description}</Label>
          <Spacing />
        </>
      )}
      {metadata.traits && (
        <>
          <Label>Traits: {metadata.traits}</Label>
          <Spacing />
        </>
      )}
      {metadata.image && (
        <>
          <Label>Image:</Label>
          <MetadataImagePreview image={metadata.image} />
          <Spacing />
        </>
      )}
      {metadata.animationUrl && (
        <>
          <Label>Animation:</Label>
          <MetadataAnimationPreview animationUrl={metadata.animationUrl} />
          <Spacing />
        </>
      )}
      <LabelWithSpacing>
        Max supply: {mintConfig.maxSupply || "Open Edition"}
      </LabelWithSpacing>
      <LabelWithSpacing>
        Mint price (in ETH): {mintConfig.priceInEth}
      </LabelWithSpacing>
      <LabelWithSpacing>
        Mint end timestamp (in block time):{" "}
        {mintConfig.mintEndTimestamp || "Open Forever"}
      </LabelWithSpacing>
      <Button
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
    </>
  );
}
