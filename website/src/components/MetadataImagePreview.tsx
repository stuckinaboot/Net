import { sanitizeMediaUrl } from "./core/utils";

export default function InscriptionImagePreview(props: { image: string }) {
  return <img src={sanitizeMediaUrl(props.image)} className="inline w-16" />;
}
