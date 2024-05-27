import { cn } from "@/lib/utils";
import { sanitizeMediaUrl } from "./core/utils";

export default function InscriptionImagePreview(props: {
  image: string;
  size?: "w-16" | "w-32" | "w-64";
}) {
  return (
    <img
      src={sanitizeMediaUrl(props.image)}
      className={cn("inline", props.size || "w-16")}
    />
  );
}
