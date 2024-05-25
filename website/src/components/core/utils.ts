// Use nft storage gateway as that's where media is stored
const IPFS_URL_WEBSITE = "https://nftstorage.link/ipfs/"; //"https://ipfs.io/ipfs/";
const IPFS_PREFIX = "ipfs://";

// Sometimes we may want to use ipfs.io domain specifically because our
// main IPFS_URL_WEBSITE may involve redirects which isn't suitable for certain use-cases
// (ex. including images in frames)
const IPFS_IO_PREFIX = "https://ipfs.io/ipfs/";

export function sanitizeMediaUrl(inputUrl: string, useIpfsIoPrefix?: boolean) {
  let url = inputUrl;
  if (url.startsWith(IPFS_PREFIX)) {
    const website = useIpfsIoPrefix ? IPFS_IO_PREFIX : IPFS_URL_WEBSITE;
    url = website + url.substring(IPFS_PREFIX.length);
  }
  // Add future additional sanitization here
  return url;
}
