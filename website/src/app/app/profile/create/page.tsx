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
import ProfileEditor from "@/components/core/net-apps/profile/ProfileEditor";
import SaveProfileButton from "@/components/core/net-apps/profile/SaveProfileButton";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Page() {
  const [profileContents, setProfileContents] = useState("TODO");
  return (
    <BasePageCard
      description={<>Create your profile and share your profile.</>}
      content={{
        node: <ProfileEditor />,
      }}
      footer={(disabled) => <SaveProfileButton disabled={disabled} />}
    />
  );
}
