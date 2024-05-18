import { Label } from "@/components/ui/label";
import IframeRenderer from "../../IFrameRenderer";
import { Separator } from "@/components/ui/separator";
import InscriptionAnimationPreview from "../../../MetadataAnimationPreview";
import InscriptionImagePreview from "../../../MetadataImagePreview";

export function InscriptionDialogContents(props: {
  message: string;
}): React.ReactNode {
  let inscriptionMetadata;
  let error;
  try {
    inscriptionMetadata = JSON.parse(props.message);
    if (!inscriptionMetadata.image) {
      error = "No image found";
    }
  } catch (e) {
    if (props.message.length === 0) {
      error = "Empty inscription";
    } else {
      error = "Failed to load inscription";
    }
  }

  return (
    <>
      <Label>Inscribe message as NFT</Label>
      <Separator className="m-3" />
      {error && <Label className="text-red-500">Error: {error}</Label>}
      {inscriptionMetadata?.name && (
        <>
          <br />
          <Label>Name: {inscriptionMetadata.name}</Label>
        </>
      )}
      {inscriptionMetadata?.description && (
        <>
          <br />
          <Label>Description: {inscriptionMetadata.description}</Label>
        </>
      )}
      {inscriptionMetadata?.traits && (
        <>
          <br />
          <Label>
            Traits: {JSON.stringify(inscriptionMetadata.traits, null, 4)}
          </Label>
        </>
      )}
      {inscriptionMetadata?.image && (
        <>
          <br />
          <Label>
            Image: <InscriptionImagePreview image={inscriptionMetadata.image} />
          </Label>
        </>
      )}
      {inscriptionMetadata?.animation_url && (
        <>
          <br />
          <Label>
            Animation:{" "}
            <InscriptionAnimationPreview
              animationUrl={inscriptionMetadata.animation_url}
            />
          </Label>
        </>
      )}
    </>
  );
}
