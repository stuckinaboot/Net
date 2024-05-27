import copy from "copy-to-clipboard";
import { toast } from "../../../../ui/use-toast";
import { Button } from "@/components/ui/button";

export default function ShareDropInCastButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        // https://docs.farcaster.xyz/reference/warpcast/cast-composer-intents
        const url = `https://warpcast.com/~/compose?text=Check%20out%20my%20drop!&embeds[]=${window.location.href}`;
        window.open(url, "_blank");
      }}
    >
      Share in cast
    </Button>
  );
}
