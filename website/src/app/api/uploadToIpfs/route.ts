import NFTStorageHelper from "./NftStorageHelper";
import { NextRequest } from "next/server";

type Response = {
  ipfsUrl?: string;
  error?: string;
};

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: "10mb",
  },
};

const nftStorageHelper = new NFTStorageHelper();

async function uploadToNftStorage(buffer: Buffer) {
  const cid = await nftStorageHelper.storeBuffer(buffer);
  const ipfsUrl = nftStorageHelper.ipfsUrlFromCID(cid);
  return ipfsUrl;
}

export async function POST(req: NextRequest) {
  console.log("Incoming!");
  // https://codersteps.com/articles/building-a-file-uploader-from-scratch-with-next-js-app-directory
  const formData = await req.formData();

  try {
    const file = formData.get("file") as Blob | null;
    if (!file) {
      return Response.json(
        { error: "File blob is required." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ipfsUrl = await uploadToNftStorage(buffer);
    return Response.json({ ipfsUrl });
  } catch (e) {
    console.log(e);
    return Response.json({ error: "Failed to upload" }, { status: 500 });
  }
}
