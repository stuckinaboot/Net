import { type NextRequest } from "next/server";
import { alchemy } from "../utils";

const getTokenIdsOwnedByUserInCollection = async (
  owner: string,
  contractAddress: string
): Promise<string[]> => {
  const nfts = await alchemy.nft.getNftsForOwner(owner, {
    contractAddresses: [contractAddress],
  });
  return nfts.ownedNfts.map((nft) => nft.tokenId);
};

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams;
  const owner = queryParams.get("owner");
  const contractAddress = queryParams.get("contractAddress");

  if (owner == null) {
    return Response.json({ error: "Missing owner" }, { status: 500 });
  }
  if (contractAddress == null) {
    return Response.json(
      { error: "Missing contract address" },
      { status: 500 }
    );
  }

  try {
    const tokenIds = await getTokenIdsOwnedByUserInCollection(
      owner as string,
      contractAddress as string
    );
    return Response.json({ tokenIds });
  } catch (exception) {
    return Response.json({ error: "Unknown error" });
  }
}
