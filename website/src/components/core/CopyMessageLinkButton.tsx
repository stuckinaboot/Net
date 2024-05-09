import { getUrlForSpecificMessageIndex } from "@/app/utils";
import copy from "copy-to-clipboard";
import { toast } from "../ui/use-toast";
import { CopyIcon } from "@radix-ui/react-icons";

export default function CopyMessageLinkButton(props: { messageIdx: number }) {
  return (
    <button
      onClick={() => {
        const url = getUrlForSpecificMessageIndex(props.messageIdx);
        copy(url);
        toast({
          title: "Copied link",
          description: (
            <>
              Successfully copied the link to message #{props.messageIdx} to
              your clipboard
            </>
          ),
        });
      }}
    >
      <CopyIcon />
    </button>
  );
}
