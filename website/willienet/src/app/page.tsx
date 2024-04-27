"use client";

import { Suspense } from "react";

import { useSearchParams } from "next/navigation";
import OnchainMessages from "../components/core/OnchainMessages";

export default function Home() {
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
    <Suspense>
      <OnchainMessages specificMessageIndex={specificMessageIndex} />
    </Suspense>
  );
}
