import MetadataAnimationPreview from "@/components/MetadataAnimationPreview";
import MetadataImagePreview from "@/components/MetadataImagePreview";
import { Spacing } from "@/components/core/Spacing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getInscribedDropUrlForTokenId } from "../utils";

export type InscribeDropMessageTextTyped = {
  name?: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  traits?: any;
};

export default function InscribeDropMintPreview(props: {
  previewParams: InscribeDropMessageTextTyped & {
    creator: string;
    tokenId: string;
    chainId: number;
  };
}) {
  return (
    <>
      {props.previewParams.name && (
        <>
          <Label>Inscribed Drop: {props.previewParams.name}</Label>
          <Spacing />
        </>
      )}
      {props.previewParams.creator && (
        <>
          <Label>Created by: {props.previewParams.creator}</Label>
          <Spacing />
        </>
      )}
      {props.previewParams.description && (
        <>
          <Label>Description: {props.previewParams.description}</Label>
          <Spacing />
        </>
      )}
      {props.previewParams.traits && (
        <>
          <Label>Traits: {props.previewParams.traits}</Label>
          <Spacing />
        </>
      )}
      {props.previewParams.image && (
        <>
          <Label>Image:</Label>
          <MetadataImagePreview image={props.previewParams.image} />
          <Spacing />
        </>
      )}
      {props.previewParams.animationUrl && (
        <>
          <Label>Animation:</Label>
          <MetadataAnimationPreview
            animationUrl={props.previewParams.animationUrl}
          />
          <Spacing />
        </>
      )}
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
