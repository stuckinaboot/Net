export function chainTimeToMilliseconds(chainTime: number) {
  return chainTime * 1000;
}

export async function getOwnedNftTokenIds(params: {
  userAddress: string;
  contractAddress: string;
}) {
  const res = await fetch(
    `/api/getTokenIdsOwnedByUserInCollection?owner=${params.userAddress}&contractAddress=${params.contractAddress}`
  );
  const resJson = await res.json();
  return resJson.tokenIds;
}
