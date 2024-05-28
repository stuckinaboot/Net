import { cn } from "@/lib/utils";
import { IPFS_GATEWAY, sanitizeMediaUrl } from "./core/utils";
import { useEffect, useState } from "react";

const REFETCH_INTERVAL_MS = 500;
const REFETCH_TIMEOUT_BEFORE_SWITCH_IPFS_GATEWAY = 3500;

export default function InscriptionImagePreview(props: {
  image: string;
  size?: "w-16" | "w-32" | "w-64";
  constantlyRefetchUntilLoaded?: boolean;
}) {
  const [counter, setCounter] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [ipfsGateway, setIpfsGateway] = useState(IPFS_GATEWAY.NFT_STORAGE);

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

    // Safe-guard in case the original gateway we try to use isn't returning the image
    setTimeout(() => {
      setLoaded((loaded) => {
        if (!loaded) {
          setIpfsGateway(IPFS_GATEWAY.IPFS_IO);
        }
        return loaded;
      });
    }, REFETCH_TIMEOUT_BEFORE_SWITCH_IPFS_GATEWAY);
  }, []);

  return (
    <>
      <img
        onLoad={() => {
          setLoaded(true);
        }}
        // Changing url ensures re-fetching same url won't hit cache
        src={sanitizeMediaUrl(props.image, ipfsGateway) + "?counter=" + counter}
        className={cn("inline", props.size || "w-16")}
      />
      {props.constantlyRefetchUntilLoaded && !loaded && <>loading...</>}
    </>
  );
}
