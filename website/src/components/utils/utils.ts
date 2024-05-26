import { publicClient } from "@/app/utils";
import { mainnet } from "viem/chains";

export async function getEnsName({
  address,
}: {
  address: string;
  chainId: number;
}) {
  const client = publicClient(mainnet);
  // Use public client so backend isn't responsible for making these requests
  try {
    const ensName = await client.getEnsName({
      address: address as any,
    });
    return ensName;
  } catch (e) {
    return null;
  }
}
