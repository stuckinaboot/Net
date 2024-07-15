import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { convertMessageToListingComponents } from "./utils";

export function ListDialogContents(props: {
  message: string;
  chainId: number;
}): React.ReactNode {
  const listing = convertMessageToListingComponents(props.message, 1);
  if (listing == null) {
    return null;
  }

  return (
    <>
      <Label>
        <b>Net Bazaar Listings Beta (powered by Seaport)</b>
      </Label>
      <br />
      <Label>List an NFT via Net.</Label>
      <Separator className="m-3" />
      <Label>
        Listing{" "}
        <b>
          {listing.name} #{listing.tokenId}
        </b>{" "}
        for
        <b>
          {listing.price} {listing.currency}
        </b>{" "}
        via Net Bazaar
      </Label>
      <Separator className="m-3" />
      <Label>
        <i>
          Use Net listings and bazaar functionality at your own risk. Net
          listings and bazaar are currently in beta, there could be issues that
          result in loss of funds. There may be a lack of information conveyed
          by the Net website and/or Net creators that results in loss of funds,
          including but not limited to the duration of listings. Always check
          any transactions and messages before signing them. If you make a
          mistake, you may lose funds. The creator(s) of Net are not responsible
          in any way, shape, or form for any issues you experience related to
          Net, Net listings, or Net bazaar. This is not financial or investment
          advice.
        </i>
      </Label>
    </>
  );
}
