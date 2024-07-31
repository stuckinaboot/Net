export type ProfileContents = {
  title: string;
  body: string;
  profilePicture: ProfilePicture;
};

export type ProfilePicture = {
  chainId: number;
  tokenAddress: string;
  tokenId: string;
  // TODO potentially include standard 1155 vs 721
};
