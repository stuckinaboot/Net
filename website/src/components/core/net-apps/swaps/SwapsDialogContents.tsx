import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { parseMessageToSwap } from "./utils";

export function SwapsDialogContents(props: {
  message: string;
}): React.ReactNode {
  const swap = parseMessageToSwap(props.message);

  return (
    <>
      <Label>
        <b>Swaps Beta (powered by Relay)</b>
      </Label>
      <br />
      <Label>Swap from one currency to another currency on Base.</Label>
      <Separator className="m-3" />
      <Label>{JSON.stringify(swap, null, 4)}</Label>
      <Separator className="m-3" />
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
