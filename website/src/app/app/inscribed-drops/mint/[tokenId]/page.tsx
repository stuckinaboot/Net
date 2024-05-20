"use client";

import { WILLIE_NET_CONTRACT } from "@/app/constants";
import BasePageCard from "@/components/core/BasePageCard";
import {
  INSCRIBED_DROPS_COLLECTION_URL,
  INSCRIBED_DROPS_CONTRACT,
} from "@/components/core/net-apps/inscribed-drops/constants";
import InscribeDropButton from "@/components/core/net-apps/inscribed-drops/page/InscribeDropButton";
import InscribeDropMintConfigEntry, {
  MintConfig,
  MintConfigDefined,
} from "@/components/core/net-apps/inscribed-drops/page/InscribeDropMintConfigEntry";
import InscribeDropMintPreview from "@/components/core/net-apps/inscribed-drops/page/InscribeDropMintPreview";
import MintInscribeDropButton from "@/components/core/net-apps/inscribed-drops/page/MintInscribeDropButton";
import InscriptionEntry from "@/components/core/net-apps/inscriptions/page/InscriptionEntry";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useContractRead, useReadContract } from "wagmi";

export default function Page({ params }: { params: { tokenId: string } }) {
  const [quantityToMint, setQuantityToMint] = useState("1");

  const { data, isError, isLoading } = useReadContract({
    address: WILLIE_NET_CONTRACT.address as any,
    abi: WILLIE_NET_CONTRACT.abi,
    functionName: "getMessageForAppTopic",
  });

  function convertDataToMintConfigDefined(data: any): MintConfigDefined {}

  const mintConfigDefined = convertDataToMintConfigDefined(data);

  return (
    <BasePageCard
      description={<>Mint from an inscribed drop on Net.</>}
      content={{
        node: (
          <>
            <InscribeDropMintPreview />
            <br />
            <Label>Enter quantity to mint:</Label>
            <Input
              onChange={(e) => {
                const updated = e.target.value;
                if (updated.length === 0) {
                  setQuantityToMint("1");
                  return;
                }
                try {
                  const parsed = parseInt(updated);
                  if (parsed >= 0) {
                    setQuantityToMint(parsed.toString());
                  }
                } catch (e) {}
              }}
              value={quantityToMint}
            />
          </>
        ),
      }}
      footer={(disabled) => (
        <MintInscribeDropButton
          tokenId={params.tokenId}
          quantity={+quantityToMint}
          priceInEth={mintConfigDefined.priceInEth}
          disabled={disabled}
        />
      )}
    />
  );
}
