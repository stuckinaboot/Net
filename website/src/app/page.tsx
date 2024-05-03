"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";
import WillieNetDapp from "../components/core/OnchainMessages";

function Core() {
  const searchParams = useSearchParams();
  const specificMessageIndexParam = searchParams.get("specificMessageIndex");
  let specificMessageIndex =
    specificMessageIndexParam != null
      ? parseInt(specificMessageIndexParam)
      : undefined;
  if (specificMessageIndex != null && isNaN(specificMessageIndex)) {
    specificMessageIndex = undefined;
  }

  return <WillieNetDapp specificMessageIndex={specificMessageIndex} />;
}

export default function Home() {
  return (
    <Suspense>
      <Core />
    </Suspense>
  );
}
