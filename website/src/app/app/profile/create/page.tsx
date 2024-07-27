"use client";

import BasePageCard from "@/components/core/BasePageCard";
import { INSCRIBED_DROPS_COLLECTION_URL } from "@/components/core/net-apps/inscribed-drops/constants";
import InscribeDropButton from "@/components/core/net-apps/inscribed-drops/page/InscribeDropButton";
import InscribeDropMintConfigEntry, {
  MintConfig,
} from "@/components/core/net-apps/inscribed-drops/page/InscribeDropMintConfigEntry";
import InscriptionEntry, {
  InscriptionContents,
  MediaFiles,
} from "@/components/core/net-apps/inscriptions/page/InscriptionEntry";
import SaveProfileButton from "@/components/core/net-apps/profile/SaveProfileButton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const SHOW_VIEW_DROPS_ON_OPENSEA_BUTTON = false;

export default function Page() {
  const [inscription, setInscription] = useState<InscriptionContents>({});
  const [files, setFiles] = useState<MediaFiles>({
    image: undefined,
    animation: undefined,
  });
  const [mintConfig, setMintConfig] = useState({
    priceInEth: undefined,
    maxSupply: undefined,
    mintEndTimestamp: undefined,
    maxMintsPerWallet: undefined,
  } as MintConfig);

  return (
    <BasePageCard
      description={<>Create your profile and share your profile.</>}
      content={{
        node: (
          <>
            <InscriptionEntry
              onInscriptionChanged={(inscription) =>
                setInscription(inscription)
              }
              onImageFileChanged={(file) => {
                setFiles((files) => ({ ...files, image: file }));
              }}
              onAnimationFileChanged={(file) => {
                setFiles((files) => ({ ...files, animation: file }));
              }}
              additionalOptionalComponent={
                <InscribeDropMintConfigEntry
                  onMintConfigChanged={(config) => setMintConfig(config)}
                />
              }
            />
          </>
        ),
      }}
      footer={(disabled) => <SaveProfileButton disabled={disabled} />}
    />
  );
}
