"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";
import WillieNetDapp from "../../components/core/WillieNetDapp";

function Core(props: { chainIdString: string }) {
  const searchParams = useSearchParams();
  const specificMessageIndexParam = searchParams.get("specificMessageIndex");
  let specificMessageIndex =
    specificMessageIndexParam != null
      ? parseInt(specificMessageIndexParam)
      : undefined;
  if (specificMessageIndex != null && isNaN(specificMessageIndex)) {
    specificMessageIndex = undefined;
  }

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
