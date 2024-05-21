import { NFTStorage, Blob } from "nft.storage";

const IPFS_GATEWAY_PREFIX = "https://ipfs.io/ipfs/";
const IPFS_PREFIX = "ipfs://";

// Paste your NFT.Storage API key into the quotes:
const NFT_STORAGE_KEY = process.env.NFT_STORAGE_API_KEY as string;

// create a new NFTStorage client using our API key
const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });

export default class NFTStorageHelper {
  // Returns cid
  async storeBuffer(buffer: Buffer): Promise<string> {
    return nftstorage.storeBlob(new Blob([buffer]));
  }

  // Returns cid
  async storeRaw(raw: any): Promise<string> {
    return nftstorage.storeBlob(
      new Blob([typeof raw === "string" ? raw : JSON.stringify(raw)])
    );
  }

  ipfsUrlFromCID(cid: string): string {
    return IPFS_GATEWAY_PREFIX + cid;
  }

  rawIpfsUrlFromCID(cid: string): string {
    return IPFS_PREFIX + cid;
  }
}
