import { SUPPORTED_CHAINS } from "@/app/constants";
import { createPublicClient, http } from "viem";

function getChain(chainId: number) {
  return SUPPORTED_CHAINS.find((x) => x.id === chainId);
}

export async function getEnsName({
  address,
  chainId,
}: {
  address: string;
  chainId: number;
}) {
  const publicClient = createPublicClient({
    chain: getChain(chainId),
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
