"use client";

import { WILLIE_NET_CONTRACT } from "@/app/constants";
import BasePageCard from "@/components/core/BasePageCard";
import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIBE_DROP_INSCRIBE_TOPIC,
} from "@/components/core/net-apps/inscribed-drops/constants";
import InscribeDropMintPreview from "@/components/core/net-apps/inscribed-drops/page/InscribeDropMintPreview";
import { Button } from "@/components/ui/button";
import MintInscribeDropButton from "@/components/core/net-apps/inscribed-drops/page/MintInscribeDropButton";
import { OnchainMessage } from "@/components/core/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useChainId, useReadContract } from "wagmi";
import { Spacing } from "@/components/core/Spacing";
import { getInscribedDropFromOnchainMessage } from "@/components/core/net-apps/inscribed-drops/utils";
import CopyInscribedDropLinkButton from "@/components/core/net-apps/inscribed-drops/page/CopyInscribedDropLinkButton";
import ShareDropInCastButton from "@/components/core/net-apps/inscribed-drops/page/ShareDropInCastButton";
import { getInscribedDropUrlForTokenId } from "@/components/core/net-apps/inscribed-drops/utils";

export default function Page({ params }: { params: { tokenId: string } }) {
  const [quantityToMint, setQuantityToMint] = useState("1");
  const chainId = useChainId();

  const { data } = useReadContract({
    address: WILLIE_NET_CONTRACT.address as any,
    abi: WILLIE_NET_CONTRACT.abi,
    functionName: "getMessageForAppTopic",
    args: [
      params.tokenId,
      INSCRIBED_DROPS_CONTRACT.address,
      INSCRIBE_DROP_INSCRIBE_TOPIC,
    ],
  });

  const typedData = getInscribedDropFromOnchainMessage(data as OnchainMessage);

  return (
    <BasePageCard
      description={
        <>
          Mint from an inscribed drop on Net. <br />
          <div className="flex space-x-1">
            <CopyInscribedDropLinkButton />
            <ShareDropInCastButton />
          </div>
        </>
      }
      content={{
        node: typedData ? (
          <>
            <InscribeDropMintPreview
              previewParams={{
                inscribedDrop: typedData,
                creator: typedData.creator,
                tokenId: params.tokenId,
                chainId,
              }}
            />
          </>
        ) : (
          <>Loading mint...</>
        ),
      }}
      footer={(disabled) =>
        typedData ? (
          <>
            <Label>Enter quantity to mint:</Label>
            <Input
              onChange={(e) => {
                const updated = e.target.value;
                if (updated.length === 0) {
                  setQuantityToMint("");
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
            <Spacing />
            <MintInscribeDropButton
              tokenId={params.tokenId}
              chainId={chainId}
              quantity={+quantityToMint}
              priceInEth={typedData.mintConfig.priceInEth}
              disabled={disabled}
            />
          </>
        ) : null
      }
    />
  );
}
