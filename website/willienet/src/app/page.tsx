"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import MintButton from "../components/core/MintButton";
import { WILLIE_NET_CONTRACT } from "./constants";
import SendMessageButton from "../components/core/SendMessageButton";
import OnchainMessages from "../components/core/OnchainMessages";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [message, setMessage] = useState("");
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl">Willienet</h1>
      <ConnectButton />
      <Input
        placeholder="Enter message to send"
        contentEditable
        onChange={(e) => {
          const txt = e.target.value;
          setMessage(txt);
        }}
      />
      <SendMessageButton
        tokenId={userWillieNetTokenIds[0]}
        message={message}
        topic="default"
      />
      <OnchainMessages />
    </main>
  );
}
