import { testnetsEnabled } from "@/app/constants";
import { Alchemy, Network } from "alchemy-sdk";
import { type NextRequest } from "next/server";

const settings = {
  apiKey: testnetsEnabled
    ? process.env["NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_ID"]
    : process.env["NEXT_PUBLIC_ALCHEMY_BASE_ID"],
  network: testnetsEnabled ? Network.BASE_SEPOLIA : Network.BASE_MAINNET,
};

const alchemy = new Alchemy(settings);

const getImagesForTokenIdsInCollection = async (
  contractAddress: string,
  tokenIds: string[]
): Promise<(string | undefined)[]> => {
  const nfts = await alchemy.nft.getNftMetadataBatch(
    tokenIds.map((tokenId) => ({ tokenId, contractAddress }))
  );
  const images = nfts.nfts.map((nft) => nft.image.cachedUrl);
  return images;
};

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams;
  const tokenIdsStr = queryParams.get("tokenIds");
  const contractAddress = queryParams.get("contractAddress");
  const tokenIds = tokenIdsStr?.split(",");

  if (contractAddress == null) {
    return Response.json(
      { error: "Missing contract address" },
      { status: 500 }
    );
  }
  if (tokenIds == null) {
    return Response.json({ error: "Missing token ids" }, { status: 500 });
  }

  try {
    const images = await getImagesForTokenIdsInCollection(
      contractAddress,
      tokenIds
    );
    return Response.json({ images });
  } catch (exception) {
    return Response.json({ error: "Unknown error" });
  }
}
