import { testnetsEnabled } from "@/app/constants";
import { Alchemy, Network } from "alchemy-sdk";
import { type NextRequest } from 'next/server'


const settings = {
    apiKey:
        testnetsEnabled
            ? process.env["NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_ID"]
            : process.env["NEXT_PUBLIC_ALCHEMY_BASE_ID"],
    network:
        testnetsEnabled ?
            Network.BASE_SEPOLIA
            : Network.BASE_MAINNET,
};

const alchemy = new Alchemy(settings);

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
    const owner = queryParams.get('owner')
    const contractAddress = queryParams.get('contractAddress')

    if (owner == null) {
        return Response.json({ error: "Missing owner" }, { status: 500 })
    }
    if (contractAddress == null) {
        return Response.json({ error: "Missing contract address" }, { status: 500 })
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
};
