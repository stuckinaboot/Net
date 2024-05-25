import { Label } from "@/components/ui/label";
import IframeRenderer from "./core/IFrameRenderer";
import { sanitizeMediaUrl } from "./core/utils";
import mime from "mime-types";
import InscriptionImagePreview from "./MetadataImagePreview";
import ReactPlayer from "react-player";

enum AnimationType {
  VIDEO,
  HTML,
  SVG,
  NONE,
}

function getAnimationType(animationUrl: string) {
  const contentType = mime.lookup(animationUrl);
  if (contentType === false) {
    return AnimationType.NONE;
  }
  if (contentType.startsWith("video")) {
    return AnimationType.VIDEO;
  }
  if (contentType.startsWith("image/svg+xml")) {
    return AnimationType.SVG;
  }
  if (contentType.startsWith("text/html")) {
    return AnimationType.HTML;
  }
  return AnimationType.NONE;
}

const SIZE = "150px";

export default function InscriptionAnimationPreview({
  animationUrl,
}: {
  animationUrl: string;
}) {
  const animationType = getAnimationType(animationUrl);
  if (animationType === AnimationType.NONE) {
    return <Label>Unknown animation type</Label>;
  }
  if (animationType === AnimationType.HTML) {
    return (
      <IframeRenderer size={SIZE} htmlString={sanitizeMediaUrl(animationUrl)} />
    );
  }
  if (animationType === AnimationType.SVG) {
    return <InscriptionImagePreview image={animationUrl} />;
  }
  if (animationType === AnimationType.VIDEO) {
    return (
      <ReactPlayer url={animationUrl} width={SIZE} height={SIZE} controls />
    );
  }

  return null;
}
