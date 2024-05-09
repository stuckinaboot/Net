import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export async function getEnsName({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}) {
  const publicClient = createPublicClient({
    // Just use mainnet ens names
    chain: mainnet,
    transport: http(),
  });
  // Use public client so backend isn't responsible for making these requests
  try {
    const ensName = await publicClient.getEnsName({
      address: address as any,
    });
    return ensName;
  } catch (e) {
    return null;
  }
}
