import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { parseMessageToSwap } from "./utils";
import { formatEther } from "viem";

export function SwapsDialogContents(props: {
  message: string;
}): React.ReactNode {
  const swap = parseMessageToSwap(props.message);
  if (swap == null) {
    return <>No valid swap found</>;
  }

  return (
    <>
      <Label>
        <b>Swaps Beta (powered by Relay)</b>
      </Label>
      <br />
      <Label>Swap from one currency to another currency on Base.</Label>
      <Separator className="m-3" />
      <Label>
        Swapping {formatEther(BigInt(swap.from.amount))}{" "}
        {swap.from.currency.name} to {swap.to.currency.name}
      </Label>
      <Separator className="m-3" />
      <Label>
        <i>
          Use swaps at your own risk. Swaps is currenty in beta, there could be
          issues that result in loss of funds. Always check any transactions and
          messages before signing them. The creator(s) of Net are not
          responsible for any issues you experience related to swaps. This is
          not financial or investment advice.
        </i>
      </Label>
    </>
  );
}
