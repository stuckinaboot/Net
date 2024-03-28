"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { WILLIE_NET_CONTRACT } from "./constants";
import OnchainMessages from "../components/core/OnchainMessages";

const SHOW_TITLE = false;

export default function Home() {
  const [userWillieNetTokenIds, setUserWillieNetTokenIds] = useState([]);

  const { isConnected, address } = useAccount();

  async function updateOwnedWillieNetNftTokenIds() {
    const res = await fetch(
      `/api/getTokenIdsOwnedByUserInCollection?owner=${address}&contractAddress=${WILLIE_NET_CONTRACT.address}`
    );
    const resJson = await res.json();
    setUserWillieNetTokenIds(resJson.tokenIds || []);
  }

  useEffect(() => {
    (async () => {
      if (!isConnected) {
        return;
      }
      await updateOwnedWillieNetNftTokenIds();
    })();
  }, [isConnected]);

  return (
    <main className="flex flex-col items-center justify-between p-2">
      {SHOW_TITLE && <h1 className="text-4xl">Willienet</h1>}
      <OnchainMessages />
    </main>
  );
}
