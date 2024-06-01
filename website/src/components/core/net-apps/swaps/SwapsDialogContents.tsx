import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { parseMessageToSwap } from "./utils";

export function SwapsDialogContents(props: {
  message: string;
}): React.ReactNode {
  const swap = parseMessageToSwap(props.message);

  return (
    <>
      <Label>Swap (powered by Relay)</Label>
      <Separator className="m-3" />
      <Label>{JSON.stringify(swap, null, 4)}</Label>
      <Label>
        <i>
          Use swaps at your own risk. The creator(s) of Net are not responsible
          for any issues you experience related to swaps. This is not financial
          or investment advice.
        </i>
      </Label>
    </>
  );
}
