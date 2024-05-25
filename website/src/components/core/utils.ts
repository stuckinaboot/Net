// Use nft storage gateway as that's where media is stored
const IPFS_URL_WEBSITE = "https://nftstorage.link/ipfs/"; //"https://ipfs.io/ipfs/";
const IPFS_PREFIX = "ipfs://";

// TODO sanitize to nft storage link

export function sanitizeMediaUrl(inputUrl: string) {
  let url = inputUrl;
  if (url.startsWith(IPFS_PREFIX)) {
    url = IPFS_URL_WEBSITE + url.substring(IPFS_PREFIX.length);
  }
  // Add future additional sanitization here
  return url;
}
