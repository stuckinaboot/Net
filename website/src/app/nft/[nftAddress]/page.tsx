"use client";

import OnchainMessages from "@/components/core/OnchainMessages";

export default function Page({ params }: { params: { nftAddress: string } }) {
  return <OnchainMessages nftAddress={params.nftAddress} />;
}
