"use client";

import BasePageCard from "@/components/core/BasePageCard";
import { INSCRIPTIONS_COLLECTION_URL } from "@/components/core/net-apps/inscriptions/constants";
import InscribeButton from "@/components/core/net-apps/inscriptions/page/InscribeButton";
import InscriptionEntry from "@/components/core/net-apps/inscriptions/page/InscriptionEntry";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [message, setMessage] = useState("");

  return (
    <BasePageCard
      description={
        <>
          Inscribe your art on Net and allow others to mint. Enter metadata for
          your art, configure your mint, and press inscribe.
          <br />
          <Button
            onClick={() => window.open(INSCRIPTIONS_COLLECTION_URL, "_blank")}
            variant="outline"
          >
            View Inscribed Drops on OpenSea
          </Button>
        </>
      }
      content={{
        node: (
          <InscriptionEntry
            onInscriptionChanged={(inscription) => setMessage(inscription)}
          />
        ),
      }}
      footer={(disabled) => (
        <InscribeButton inscription={message} disabled={disabled} />
      )}
    />
  );
}
