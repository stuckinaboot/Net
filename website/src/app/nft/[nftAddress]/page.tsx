"use client";

import WillieNetDapp from "@/components/core/OnchainMessages";

export default function Page({ params }: { params: { nftAddress: string } }) {
  return <WillieNetDapp nftAddress={params.nftAddress} />;
}
