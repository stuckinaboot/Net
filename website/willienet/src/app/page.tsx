"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { WILLIE_NET_CONTRACT } from "./constants";
import OnchainMessages from "../components/core/OnchainMessages";
import { getOwnedNftTokenIds } from "./utils";

export default function Home() {
  const [userWillieNetTokenIds, setUserWillieNetTokenIds] = useState([]);

  const { isConnected, address } = useAccount();

  async function updateOwnedWillieNetNftTokenIds() {
    const tokenIds = await getOwnedNftTokenIds({
      userAddress: address as string,
      contractAddress: "todo",
    });
    setUserWillieNetTokenIds(tokenIds || []);
  }

  useEffect(() => {
    (async () => {
      if (!isConnected) {
        return;
      }
      await updateOwnedWillieNetNftTokenIds();
    })();
  }, [isConnected]);

  return <OnchainMessages />;
}
