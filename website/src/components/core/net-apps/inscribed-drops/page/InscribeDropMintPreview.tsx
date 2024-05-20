import MetadataAnimationPreview from "@/components/MetadataAnimationPreview";
import MetadataImagePreview from "@/components/MetadataImagePreview";
import { Spacing } from "@/components/core/Spacing";
import { Label } from "@/components/ui/label";

export type InscribeDropMessageTextTyped = {
  name?: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  traits?: any;
};

export default function InscribeDropMintPreview(props: {
  previewParams: InscribeDropMessageTextTyped & { creator: string };
}) {
  return (
    <>
      {props.previewParams.name && (
        <>
          <Label>Name: {props.previewParams.name}</Label>
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
      {props.previewParams.creator && (
        <>
          <Label>Creator: {props.previewParams.creator}</Label>
        </>
      )}
    </>
  );
}
