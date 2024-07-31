"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";
import { useChainId } from "wagmi";
import { chainIdToOpenSeaChainString } from "./utils";

function Core() {
  const router = useRouter();
  const chainId = useChainId();

  useEffect(() => {
    const chain = chainIdToOpenSeaChainString(chainId);
    router.push(`/${chain}`);
  }, [chainId]);

  return <></>;
}

export default function Home() {
  return <Core />;
}
