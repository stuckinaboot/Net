import { TESTNETS_ENABLED } from "@/app/constants";
import { ethers } from "ethers";
import { NextRequest } from "next/server";
import { OpenSeaSDK, Chain } from "opensea-js";

// This example provider won't let you make transactions, only read-only calls:
const provider = new ethers.JsonRpcProvider(
  TESTNETS_ENABLED
    ? process.env["NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_ID"]
    : process.env["NEXT_PUBLIC_ALCHEMY_BASE_ID"]
);

const CHAIN = TESTNETS_ENABLED ? Chain.BaseSepolia : Chain.Base;
const openseaSDK = new OpenSeaSDK(provider, {
  chain: CHAIN,
  apiKey: process.env.OPENSEA_API_KEY,
});

export async function GET(req: NextRequest) {
  const queryParams = req.nextUrl.searchParams;
  const tokenId = queryParams.get("tokenId");
  const contractAddress = queryParams.get("contractAddress");

  if (tokenId == null) {
    return Response.json({ error: "Missing token id" }, { status: 500 });
  }
  if (contractAddress == null) {
    return Response.json(
      { error: "Missing contract address" },
      { status: 500 }
    );
  }

  try {
    const metadata = await openseaSDK.api.getNFT(
      contractAddress,
      tokenId,
      CHAIN
    );
    console.log(metadata.nft);
    return Response.json({ foo: "bar" });
  } catch (exception) {
    return Response.json({ error: "Unknown error" });
  }
}
