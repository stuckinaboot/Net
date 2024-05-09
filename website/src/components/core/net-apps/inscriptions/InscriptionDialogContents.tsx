import { Label } from "@/components/ui/label";
import IframeRenderer from "../../IFrameRenderer";
import { Separator } from "@/components/ui/separator";

export function InscriptionDialogContents(props: {
  message: string;
}): React.ReactNode {
  const inscriptionMetadata = JSON.parse(props.message);
  return (
    <>
      <Label>Inscribe message as NFT</Label>
      <Separator className="m-3" />
      {inscriptionMetadata.name && (
        <>
          <br />
          <Label>Name: {inscriptionMetadata.name}</Label>
        </>
      )}
      {inscriptionMetadata.description && (
        <>
          <br />
          <Label>Description: {inscriptionMetadata.description}</Label>
        </>
      )}
      {inscriptionMetadata.traits && (
        <>
          <br />
          <Label>Traits: {inscriptionMetadata.traits}</Label>
        </>
      )}
      {inscriptionMetadata.image && (
        <>
          <br />
          <Label>
            Image:{" "}
            <img src={inscriptionMetadata.image} className="inline w-16" />
          </Label>
        </>
      )}
      {inscriptionMetadata.animation_url && (
        <>
          <br />
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
