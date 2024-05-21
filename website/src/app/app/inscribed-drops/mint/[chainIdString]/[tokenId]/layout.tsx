import { getInscribedDrop } from "@/components/core/net-apps/inscribed-drops/utils";
import { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { chainIdString: string; tokenId: string };
}): Promise<Metadata> {
  const inscribedDrop = await getInscribedDrop({
    chainIdString: params.chainIdString,
    tokenId: params.tokenId,
  });
  if (inscribedDrop == null) {
    return {};
  }

  const image = inscribedDrop.metadata.image;

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
