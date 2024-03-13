"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import MintButton from "./MintButton";
import { WILLIE_NET_CONTRACT } from "./constants";
import SendMessageButton from "./SendMessageButton";
import OnchainMessages from "./OnchainMessages";
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
    setUserWillieNetTokenIds(resJson.tokenIds);
  }

  useEffect(() => {
    (async () => {
      if (!isConnected) {
        return;
      }
      await updateOwnedWillieNetNftTokenIds();
    })();
  }, [isConnected]);

  console.log("Address is", address);
  console.log("Connected", isConnected);

  async function mintWillieNetNft() {}

  async function sendMessage(params: {
    tokenId: number;
    message: string;
    topic: string;
  }) {}

  async function readLatestMessages() {}

  function alert(params: { message: string }) {
    console.log(params.message);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ConnectButton />
      <MintButton />
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
      <p>Address: {address}</p>
      <OnchainMessages />
    </main>
  );
}
