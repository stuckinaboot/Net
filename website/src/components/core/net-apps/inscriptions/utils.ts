import { uploadToNftStorage } from "@/app/utils";
import { InscriptionContents, MediaFiles } from "./page/InscriptionEntry";

export async function generateInscriptionContentsAfterUploadingMedia(params: {
  mediaFiles: MediaFiles;
  inscriptionContents: InscriptionContents;
}): Promise<InscriptionContents> {
  const { mediaFiles, inscriptionContents } = params;
  if (mediaFiles.image) {
    const res = await uploadToNftStorage(mediaFiles.image);
    if (res.error) {
      throw new Error("Failed to upload image");
    }
    if (!res.ipfsUrl) {
      throw new Error("Failed to upload image to IPFS");
    }
    inscriptionContents.image = res.ipfsUrl;
  }

  if (mediaFiles.animation) {
    const res = await uploadToNftStorage(mediaFiles.animation);
    if (res.error) {
      throw new Error("Failed to upload animation");
    }
    if (!res.ipfsUrl) {
      throw new Error("Failed to upload animation to IPFS");
    }
    inscriptionContents.animation_url = res.ipfsUrl;
  }
  return inscriptionContents;
}
