import { WEBSITE_BASE_URL } from "@/app/constants";
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
      "fc:frame:button:1:target": `${WEBSITE_BASE_URL}/api/frames/inscribed-drops/mint?chainId=${params.chainIdString}&tokenId=${params.tokenId}`,
      "fc:frame:button:1:post_url": `${WEBSITE_BASE_URL}/api/frames/inscribed-drops/${params.chainIdString}/${params.tokenId}`,
      "fc:frame:input:text": "Amount to mint (default 1)",
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
