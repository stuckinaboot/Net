import { Label } from "@/components/ui/label";
import IframeRenderer from "../../IFrameRenderer";
import { Separator } from "@/components/ui/separator";

const IPFS_URL_WEBSITE = "https://ipfs.io/ipfs/";
const IPFS_PREFIX = "ipfs://";

function sanitizeMediaUrl(inputUrl: string) {
  let url = inputUrl;
  if (url.startsWith(IPFS_PREFIX)) {
    url = IPFS_URL_WEBSITE + url.substring(IPFS_PREFIX.length);
  }
  // Add future additional sanitization here
  return url;
}

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
          <Label>
            Traits: {JSON.stringify(inscriptionMetadata.traits, null, 4)}
          </Label>
        </>
      )}
      {inscriptionMetadata.image && (
        <>
          <br />
          <Label>
            Image:{" "}
            <img
              src={sanitizeMediaUrl(inscriptionMetadata.image)}
              className="inline w-16"
            />
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
              htmlString={sanitizeMediaUrl(inscriptionMetadata.animation_url)}
            />
          </Label>
        </>
      )}
    </>
  );
}
