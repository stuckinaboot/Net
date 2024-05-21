import { WILLIE_NET_CONTRACT } from "@/app/constants";
import { openSeaChainStringToChain, publicClient } from "@/app/utils";
import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIBE_DROP_INSCRIBE_TOPIC,
} from "@/components/core/net-apps/inscribed-drops/constants";
import { OnchainMessage } from "@/components/core/types";
import { Metadata } from "next";
import { readContract } from "viem/actions";

export async function generateMetadata({
  params,
}: {
  params: { chainIdString: string; tokenId: string };
}): Promise<Metadata> {
  const chain = openSeaChainStringToChain(params.chainIdString);
  if (chain == null) {
    return {};
  }

  const res: OnchainMessage | undefined = (await readContract(
    publicClient(chain),
    {
      address: WILLIE_NET_CONTRACT.address as any,
      abi: WILLIE_NET_CONTRACT.abi,
      functionName: "getMessageForAppTopic",
      args: [
        params.tokenId,
        INSCRIBED_DROPS_CONTRACT.address,
        INSCRIBE_DROP_INSCRIBE_TOPIC,
      ],
    }
  )) as OnchainMessage;
  if (res == null) {
    return {};
  }
  let image;
  try {
    const parsed = JSON.parse(res.text);
    image = parsed.image;
  } catch (e) {}

  return {
    other: {
      "fc:frame": "vNext",
      "fc:frame:image": image,
      "og:image": image,
      "fc:frame:button:1": "Mint",
      "fc:frame:button:1:action": "tx",
      "fc:frame:button:1:target": "https://frame.example.com/get_tx_data",
      "fc:frame:button:1:post_url": "https://frame.example.com/tx_callback",
      "fc:frame:input:text": "Quantity to mint (default 1)",
    },
  };
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
