import { cn } from "@/lib/utils";
import { sanitizeMediaUrl } from "./core/utils";
import { useEffect, useState } from "react";

const REFETCH_INTERVAL_MS = 500;

export default function InscriptionImagePreview(props: {
  image: string;
  size?: "w-16" | "w-32" | "w-64";
  constantlyRefetchUntilLoaded?: boolean;
}) {
  const [counter, setCounter] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (props.constantlyRefetchUntilLoaded) {
      let interval = setInterval(() => {
        setLoaded((loaded) => {
          if (loaded) {
            clearInterval(interval);
          }
          return loaded;
        });
        setCounter((current) => {
          return current + 1;
        });
      }, REFETCH_INTERVAL_MS);
    }
  }, []);

  return (
    <>
      <img
        onLoad={() => {
          setLoaded(true);
        }}
        // Changing url ensures re-fetching same url won't hit cache
        src={sanitizeMediaUrl(props.image, true) + "?counter=" + counter}
        className={cn("inline", props.size || "w-16")}
      />
      {props.constantlyRefetchUntilLoaded && !loaded && <>loading...</>}
    </>
  );
}
