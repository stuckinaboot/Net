export function chainTimeToMilliseconds(chainTime: number) {
  return chainTime * 1000;
}

export async function getOwnedNftTokenIds(params: {
  userAddress: string;
  contractAddress: string;
}) {
  console.log("CALLED");
  const res = await fetch(
    `/api/getTokenIdsOwnedByUserInCollection?owner=${params.userAddress}&contractAddress=${params.contractAddress}`
  );
  const resJson = await res.json();
  return resJson.tokenIds;
}

export async function getNftImages(params: {
  contractAddress: string;
  tokenIds: string[];
}) {
  const res = await fetch(
    `/api/getImagesForTokenIdsInCollection?contractAddress=${
      params.contractAddress
    }&tokenIds=${params.tokenIds.join(",")}`
  );
  const resJson = await res.json();
  return resJson.images;
}
