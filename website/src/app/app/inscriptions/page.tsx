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
