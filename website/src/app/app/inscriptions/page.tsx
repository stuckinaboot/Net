"use client";

import BasePageCard from "@/components/core/BasePageCard";
import { INSCRIPTIONS_COLLECTION_URL } from "@/components/core/net-apps/inscriptions/constants";
import InscribeButton from "@/components/core/net-apps/inscriptions/page/InscribeButton";
import InscriptionEntry, {
  InscriptionContents,
  MediaFiles,
} from "@/components/core/net-apps/inscriptions/page/InscriptionEntry";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useChainId } from "wagmi";

export default function Page() {
  const [inscription, setInscriptionContents] = useState<InscriptionContents>(
    {}
  );
  const [mediaFiles, setMediaFiles] = useState<MediaFiles>({
    image: undefined,
    animation: undefined,
  });
  const chainId = useChainId();

  return (
    <BasePageCard
      description={
        <>
          Inscribe art on Net. Enter metadata for your art and press inscribe to
          have your art inscribed on Net.
          <br />
          <Button
            onClick={() => window.open(INSCRIPTIONS_COLLECTION_URL, "_blank")}
            variant="outline"
          >
            View Inscriptions on OpenSea
          </Button>
        </>
      }
      content={{
        node: (
          <InscriptionEntry
            onInscriptionChanged={(inscription) =>
              setInscriptionContents(inscription)
            }
            onImageFileChanged={(file) => {
              setMediaFiles((files) => ({ ...files, image: file }));
            }}
            onAnimationFileChanged={(file) => {
              setMediaFiles((files) => ({ ...files, animation: file }));
            }}
          />
        ),
      }}
      footer={(disabled) => (
        <InscribeButton
          inscription={inscription}
          mediaFiles={mediaFiles}
          disabled={disabled}
          chainId={chainId}
        />
      )}
    />
  );
}
