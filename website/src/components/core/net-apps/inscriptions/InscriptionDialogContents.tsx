import { Label } from "@/components/ui/label";
import IframeRenderer from "../../IFrameRenderer";

export function InscriptionDialogContents(props: {
  message: string;
}): React.ReactNode {
  const inscriptionMetadata = JSON.parse(props.message);
  return (
    <>
      <Label className="text-lg">Inscribe message as NFT</Label>
      {inscriptionMetadata.name && (
        <>
          <Label>Name: {inscriptionMetadata.name}</Label>
        </>
      )}
      {inscriptionMetadata.description && (
        <>
          <Label>Description: {inscriptionMetadata.description}</Label>
          <br />
        </>
      )}
      {inscriptionMetadata.traits && (
        <>
          <Label>Traits: {inscriptionMetadata.traits}</Label>
          <br />
        </>
      )}
      {inscriptionMetadata.image && (
        <>
          <Label>
            Image:{" "}
            <img src={inscriptionMetadata.image} className="inline w-16" />
          </Label>
          <br />
        </>
      )}
      {inscriptionMetadata.animation_url && (
        <>
          <Label>
            Animation:{" "}
            <IframeRenderer
              size="150px"
              htmlString={inscriptionMetadata.animation_url}
            />
          </Label>
        </>
      )}
    </>
  );
}
