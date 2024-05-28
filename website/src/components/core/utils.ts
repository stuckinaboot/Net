import format from "string-format";

// Use nft storage gateway as that's where media is stored
const IPFS_URL_WEBSITE = "https://nftstorage.link/ipfs/"; //"https://ipfs.io/ipfs/";
const IPFS_PREFIX = "ipfs://";

// Sometimes we may want to use ipfs.io domain specifically because our
// main IPFS_URL_WEBSITE may involve redirects which isn't suitable for certain use-cases
// (ex. including images in frames)
const IPFS_IO_PREFIX = "https://ipfs.io/ipfs/";

const NFT_STORAGE_FORMAT = "https://{ipfsHash}.ipfs.nftstorage.link{path}";

export enum IPFS_GATEWAY {
  NFT_STORAGE,
  IPFS_IO,
}

export function sanitizeMediaUrl(
  inputUrl: string,
  useSpecificIpfsGateway?: IPFS_GATEWAY
) {
  if (!inputUrl.startsWith(IPFS_PREFIX)) {
    return inputUrl;
  }

  if (useSpecificIpfsGateway != null) {
    const hashAndPath = inputUrl.substring(IPFS_PREFIX.length);
    if (useSpecificIpfsGateway === IPFS_GATEWAY.NFT_STORAGE) {
      const pathIdx = hashAndPath.indexOf("/");
      const hash =
        pathIdx >= 0 ? hashAndPath.substring(0, pathIdx) : hashAndPath;
      const path = pathIdx >= 0 ? hashAndPath.substring(pathIdx) : "";
      return format(NFT_STORAGE_FORMAT, { ipfsHash: hash, path });
    } else if (useSpecificIpfsGateway === IPFS_GATEWAY.IPFS_IO) {
      return IPFS_IO_PREFIX + hashAndPath;
    }
  }

  // Add future additional sanitization here
  return IPFS_URL_WEBSITE + inputUrl.substring(IPFS_PREFIX.length);
}
