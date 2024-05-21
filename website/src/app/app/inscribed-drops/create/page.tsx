"use client";

import BasePageCard from "@/components/core/BasePageCard";
import { INSCRIBED_DROPS_COLLECTION_URL } from "@/components/core/net-apps/inscribed-drops/constants";
import InscribeDropButton from "@/components/core/net-apps/inscribed-drops/page/InscribeDropButton";
import InscribeDropMintConfigEntry, {
  MintConfig,
} from "@/components/core/net-apps/inscribed-drops/page/InscribeDropMintConfigEntry";
import InscriptionEntry from "@/components/core/net-apps/inscriptions/page/InscriptionEntry";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [message, setMessage] = useState("");
  const [mintConfig, setMintConfig] = useState({
    priceInEth: undefined,
    maxSupply: undefined,
    mintEndTimestamp: undefined,
  } as MintConfig);

  return (
    <BasePageCard
      description={
        <>
          Inscribe your art on Net and allow others to mint. Enter metadata for
          your art, configure your mint, and press inscribe.
          <br />
          <Button
            onClick={() =>
              window.open(INSCRIBED_DROPS_COLLECTION_URL, "_blank")
            }
            variant="outline"
          >
            View Inscribed Drops on OpenSea
          </Button>
        </>
      }
      content={{
        node: (
          <>
            <InscriptionEntry
              onInscriptionChanged={(inscription) => setMessage(inscription)}
            />
            <br />
            <InscribeDropMintConfigEntry
              onMintConfigChanged={(config) => setMintConfig(config)}
            />
          </>
        ),
      }}
      footer={(disabled) => (
        <InscribeDropButton
          inscription={message}
          mintConfig={mintConfig}
          disabled={disabled}
        />
      )}
    />
  );
}
