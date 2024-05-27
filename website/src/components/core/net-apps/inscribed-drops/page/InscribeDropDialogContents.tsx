import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import InscriptionAnimationPreview from "../../../../MetadataAnimationPreview";
import InscriptionImagePreview from "../../../../MetadataImagePreview";
import { MintConfig } from "./InscribeDropMintConfigEntry";
import { InscriptionContents } from "../../inscriptions/page/InscriptionEntry";
import { getBlockTimestampAsLocalDateString } from "@/components/utils/utils";

export function InscribeDropDialogContents(props: {
  inscriptionContents: InscriptionContents;
  mintConfig: MintConfig;
}): React.ReactNode {
  let error;
  const inscriptionMetadata = props.inscriptionContents;
  if (!inscriptionMetadata.image) {
    error = "No image found";
  }

  return (
    <>
      <Label>Inscribe drop</Label>
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
      <>
        <br />
        <Label>Mint price (in ETH): {props.mintConfig.priceInEth || "0"}</Label>
      </>
      <>
        <br />
        <Label>
          Max supply: {props.mintConfig.maxSupply || "Open Edition"}
        </Label>
      </>
      <>
        <br />
        <Label>
          Mint end date:{" "}
          {props.mintConfig.mintEndTimestamp &&
          props.mintConfig.mintEndTimestamp > 0
            ? getBlockTimestampAsLocalDateString(
                props.mintConfig.mintEndTimestamp
              )
            : "Open Forever"}
        </Label>
      </>
    </>
  );
}
