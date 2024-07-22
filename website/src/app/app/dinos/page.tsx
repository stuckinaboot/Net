"use client";

import { chainIdToChain, publicClient } from "@/app/utils";
import MetadataImagePreview from "@/components/MetadataImagePreview";
import BasePageCard from "@/components/core/BasePageCard";
import { DINOS_CONTRACT } from "@/components/core/net-apps/dinos/constants";
import { useEffect, useState } from "react";
import useAsyncEffect from "use-async-effect";
import { readContract } from "viem/actions";
import { useAccount, useChainId } from "wagmi";

const START_TOKEN_ID = 1;
const MAX_SUPPLY = 1111;

const ERC721_TOKEN_URI_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "tokenURI",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export default function Page() {
  const [userDinos, setUserDinos] = useState<number[]>([]);
  const [dinoImgs, setDinoImgs] = useState<string[]>([]);
  const { isConnected, address } = useAccount();
  const [loading, setLoading] = useState(false);
  const chainId = useChainId();

  useAsyncEffect(async () => {
    if (address == null) {
      return;
    }
    const chain = chainIdToChain(chainId);
    if (chain == null) {
      return;
    }
    setLoading(true);
    const finalDinoTokenIds = [];
    const finalDinoImages = [];
    const addressSanitized = address.toLowerCase();
    for (let i = START_TOKEN_ID; i <= MAX_SUPPLY; i++) {
      try {
        const owner = (await readContract(publicClient(chain), {
          address: DINOS_CONTRACT.address as any,
          abi: DINOS_CONTRACT.abi,
          functionName: "ownerOf",
          args: [i],
        })) as any;
        if (owner.toLowerCase() === addressSanitized) {
          const tokenURI = (await readContract(publicClient(chain), {
            address: DINOS_CONTRACT.address as any,
            abi: ERC721_TOKEN_URI_ABI,
            functionName: "tokenURI",
            args: [i],
          })) as any;
          const res = await fetch("/api/getTokenMetadataFromTokenURI", {
            method: "POST",
            body: JSON.stringify({ tokenURI }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          const metadata = (await res.json())?.metadata;
          const image = metadata?.image;
          setUserDinos([...finalDinoTokenIds, i]);
          setDinoImgs([...finalDinoImages, image]);
          finalDinoImages.push(image);
          finalDinoTokenIds.push(i);
        }
      } catch (e) {}
    }
    setLoading(false);
  }, [address]);

  return (
    <BasePageCard
      description={<>View your dinos</>}
      content={{
        node: (
          <>
            {address == null && "Connect wallet to view dinos"}
            {loading
              ? "Loading..."
              : userDinos.length === 0
              ? "No dinos found"
              : ""}
            <div>
              {userDinos.map((dino, i) => (
                <div>
                  Dino {dino}: <MetadataImagePreview image={dinoImgs[i]} />
                </div>
              ))}
            </div>
          </>
        ),
      }}
    />
  );
}
