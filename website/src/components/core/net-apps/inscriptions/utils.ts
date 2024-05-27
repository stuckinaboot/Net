import { uploadToNftStorage } from "@/app/utils";
import { InscriptionContents, MediaFiles } from "./page/InscriptionEntry";

const IPFS_PREFIX = "ipfs://";
// NOTE: this must match the IPFS gateway prefix in the NFT storage service
const IPFS_GATEWAY_PREFIX = "https://nftstorage.link/ipfs/";

export async function generateInscriptionContentsAfterUploadingMedia(params: {
  mediaFiles: MediaFiles;
  inscriptionContents: InscriptionContents;
}): Promise<InscriptionContents> {
  const { mediaFiles, inscriptionContents } = params;
  const newContents = { ...inscriptionContents };
  if (mediaFiles.image) {
    const res = await uploadToNftStorage(mediaFiles.image);
    if (res.error) {
      throw new Error("Failed to upload image");
    }
    if (!res.ipfsUrl) {
      throw new Error("Failed to upload image to IPFS");
    }
    console.log("URL!", res.ipfsUrl);
    newContents.image = res.ipfsUrl.replace(IPFS_GATEWAY_PREFIX, IPFS_PREFIX);
  }

  if (mediaFiles.animation) {
    const res = await uploadToNftStorage(mediaFiles.animation);
    if (res.error) {
      throw new Error("Failed to upload animation");
    }
    if (!res.ipfsUrl) {
      throw new Error("Failed to upload animation to IPFS");
    }
    newContents.animation_url = res.ipfsUrl.replace(
      IPFS_GATEWAY_PREFIX,
      IPFS_PREFIX
    );
  }
  return newContents;
}
