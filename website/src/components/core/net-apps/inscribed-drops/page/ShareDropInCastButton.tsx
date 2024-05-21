import copy from "copy-to-clipboard";
import { toast } from "../../../../ui/use-toast";
import { Button } from "@/components/ui/button";

export default function ShareDropInCastButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        // https://docs.farcaster.xyz/reference/warpcast/cast-composer-intents
        const url = `https://warpcast.com/~/compose?text=Mint%20my%20NFT!&embeds[]=${window.location.href}`;
        window.open(url, "_blank");
      }}
    >
      Share drop in cast
    </Button>
  );
}
