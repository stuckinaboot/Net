import MetadataAnimationPreview from "@/components/MetadataAnimationPreview";
import MetadataImagePreview from "@/components/MetadataImagePreview";
import { Spacing, SpacingSize } from "@/components/core/Spacing";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InscribedDrop, getInscribedDropUrlForTokenId } from "../utils";
import { formatEther, parseUnits } from "viem";
import { INSCRIBED_DROPS_CONTRACT } from "../constants";
import { useEnsName, useReadContract } from "wagmi";
import {
  getBlockTimestampAsLocalDateString,
  getEnsName,
} from "@/components/utils/utils";
import CopyInscribedDropLinkButton from "./CopyInscribedDropLinkButton";
import ShareDropInCastButton from "./ShareDropInCastButton";
import truncateEthAddress from "truncate-eth-address";
import { useState } from "react";

// TODO preview on NFT storage

export type InscribeDropMessageTextTyped = {
  name?: string;
  description?: string;
  image?: string;
  animationUrl?: string;
  traits?: any;
};

export default function InscribeDropMintPreview(props: {
  previewParams: {
    inscribedDrop: InscribedDrop;
    creator: string;
    tokenId: string;
    chainId: number;
  };
}) {
  const { data: totalSupplyData } = useReadContract({
    address: INSCRIBED_DROPS_CONTRACT.address as any,
    abi: INSCRIBED_DROPS_CONTRACT.abi,
    functionName: "totalSupply",
    args: [BigInt(props.previewParams.tokenId)],
  });
  const totalSupply =
    totalSupplyData != null ? +(totalSupplyData as BigInt).toString() : null;
  const ensNameResult = useEnsName({
    address: props.previewParams.creator as any,
  });

  const metadata = props.previewParams.inscribedDrop.metadata;
  const mintConfig = props.previewParams.inscribedDrop.mintConfig;

  function LabelWithSpacing(props: { children: React.ReactNode }) {
    return (
      <>
        <Label>{props.children}</Label>
        <Spacing size={SpacingSize.SMALL} />
      </>
    );
  }

  return (
    <>
      {
        <>
          <Label>
            <b>
              Inscribed Drop: {metadata.name || "Untitled"} (by{" "}
              {ensNameResult.data ||
                truncateEthAddress(props.previewParams.creator)}
              )
            </b>
          </Label>
          <br />
          <div className="flex space-x-1">
            {/* TODO three buttons all next to each other results 
            in horizontal scroll on mobile. However, using buttons on multiple lines
            results in some items being hidden on mobile. Figure out a better design for these buttons*/}
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  getInscribedDropUrlForTokenId(
                    props.previewParams.tokenId,
                    props.previewParams.chainId
                  ),
                  "_blank"
                )
              }
            >
              View on OpenSea
            </Button>
            <ShareDropInCastButton />
            <CopyInscribedDropLinkButton />
          </div>
          <Spacing size={SpacingSize.SMALL} />
        </>
      }
      {metadata.image && (
        <>
          <Label>Image: </Label>
          <br />
          <MetadataImagePreview image={metadata.image} size="w-64" />
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {metadata.animationUrl && (
        <>
          <Label>Animation: </Label>
          <MetadataAnimationPreview animationUrl={metadata.animationUrl} />
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {metadata.description && (
        <>
          <Label>Description: {metadata.description}</Label>
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      {metadata.traits && (
        <>
          <Label>Traits: {metadata.traits}</Label>
          <Spacing size={SpacingSize.SMALL} />
        </>
      )}
      <LabelWithSpacing>
        Max supply: {mintConfig.maxSupply || "Open Edition"}
      </LabelWithSpacing>
      {totalSupply && (
        <LabelWithSpacing>Total minted: {totalSupply as any}</LabelWithSpacing>
      )}
      <LabelWithSpacing>
        Mint price (in ETH): {mintConfig.priceInEth}
      </LabelWithSpacing>
      <LabelWithSpacing>
        Max mints per wallet: {mintConfig.maxMintsPerWallet || "Unlimited"}
      </LabelWithSpacing>
      <LabelWithSpacing>
        Mint end timestamp:{" "}
        {/* Converts end timestamp to date in the user's local timezone */}
        {mintConfig.mintEndTimestamp === 0
          ? "Open Forever"
          : getBlockTimestampAsLocalDateString(mintConfig.mintEndTimestamp)}
      </LabelWithSpacing>
    </>
  );
}
