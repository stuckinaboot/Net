import copy from "copy-to-clipboard";
import { toast } from "../../../../ui/use-toast";
import { Button } from "@/components/ui/button";

export default function CopyInscribedDropLinkButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        const url = window.location.href;
        copy(url);
        toast({
          title: "Copied link",
          description: (
            <>
              Successfully copied drop link. Share it with others and paste into
              a farcaster cast to mint from frame
            </>
          ),
        });
      }}
    >
      Share link
    </Button>
  );
}
