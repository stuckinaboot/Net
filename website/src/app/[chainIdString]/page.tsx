"use client";

import { Suspense, useEffect } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import WillieNetDapp from "../../components/core/WillieNetDapp";
import { watchChainId } from "@wagmi/core";
import { useAccount, useChainId } from "wagmi";
import {
  chainIdToChain,
  chainIdToChainString,
  openSeaChainStringToChain,
} from "../utils";

function Core(props: { chainIdString: string }) {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const specificMessageIndexParam = searchParams.get("specificMessageIndex");
  let specificMessageIndex =
    specificMessageIndexParam != null
      ? parseInt(specificMessageIndexParam)
      : undefined;
  if (specificMessageIndex != null && isNaN(specificMessageIndex)) {
    specificMessageIndex = undefined;
  }

  useEffect(() => {
    console.log("HIT HERE!", chainId);
    const connectedChain = chainIdToChain(chainId);
    const urlChain = openSeaChainStringToChain(props.chainIdString);
    if (
      isConnected &&
      connectedChain != null &&
      urlChain?.id !== connectedChain.id
    ) {
      // User is connected and the URL chain is different from the connected chain
      router.push(`/${chainIdToChainString(connectedChain.id)}`);
    }
  }, [chainId]);

  return (
    <WillieNetDapp
      specificMessageIndex={specificMessageIndex}
      forceInitialChainIdString={props.chainIdString}
    />
  );
}

export default function Home({
  params,
}: {
  params: { chainIdString: string };
}) {
  return (
    <Suspense>
      <Core chainIdString={params.chainIdString} />
    </Suspense>
  );
}
