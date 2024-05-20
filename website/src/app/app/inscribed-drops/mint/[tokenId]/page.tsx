"use client";

import { WILLIE_NET_CONTRACT } from "@/app/constants";
import BasePageCard from "@/components/core/BasePageCard";
import {
  INSCRIBED_DROPS_CONTRACT,
  INSCRIBE_DROP_INSCRIBE_TOPIC,
} from "@/components/core/net-apps/inscribed-drops/constants";
import { MintConfigDefined } from "@/components/core/net-apps/inscribed-drops/page/InscribeDropMintConfigEntry";
import InscribeDropMintPreview, {
  InscribeDropMessageTextTyped,
} from "@/components/core/net-apps/inscribed-drops/page/InscribeDropMintPreview";
import MintInscribeDropButton from "@/components/core/net-apps/inscribed-drops/page/MintInscribeDropButton";
import { OnchainMessage } from "@/components/core/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useChainId, useReadContract } from "wagmi";
import { fromHex } from "viem";
import { Spacing } from "@/components/core/Spacing";

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

  function convertDataToTyped(data: OnchainMessage):
    | {
        mintConfig: MintConfigDefined;
        creator: string;
        messageTextTyped: InscribeDropMessageTextTyped;
      }
    | undefined {
    if (data == null) {
      return undefined;
    }

    const msgDataFields: number[] = [];
    const msgData = data.data.substring(2);
    for (let i = 0; i < msgData.length; i += 64) {
      msgDataFields.push(
        fromHex(`0x${msgData.substring(i, i + 64)}`, "number")
      );
    }
    if (msgDataFields.length < 3) {
      return undefined;
    }

    let textTyped: InscribeDropMessageTextTyped;
    try {
      textTyped = JSON.parse(data.text);
    } catch (e) {
      return undefined;
    }

    return {
      mintConfig: {
        priceInEth: msgDataFields[0],
        maxSupply: msgDataFields[1],
        mintEndTimestamp: msgDataFields[2],
      },
      messageTextTyped: textTyped,
      creator: data.sender,
    };
  }

  const typedData = convertDataToTyped(data as OnchainMessage);

  return (
    <BasePageCard
      description={<>Mint from an inscribed drop on Net.</>}
      content={{
        node: typedData ? (
          <>
            <InscribeDropMintPreview
              previewParams={{
                ...typedData.messageTextTyped,
                creator: typedData.creator,
                tokenId: params.tokenId,
                chainId,
              }}
            />
            <Spacing />
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
          </>
        ) : (
          <>Loading mint...</>
        ),
      }}
      footer={(disabled) =>
        typedData ? (
          <MintInscribeDropButton
            tokenId={params.tokenId}
            quantity={+quantityToMint}
            priceInEth={typedData.mintConfig.priceInEth}
            disabled={disabled}
          />
        ) : null
      }
    />
  );
}
