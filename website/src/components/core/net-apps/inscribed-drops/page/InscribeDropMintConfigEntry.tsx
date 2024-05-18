import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type MintConfig = {
  maxSupply?: number;
  priceInEth?: number;
  mintEndTimestamp?: number;
};

export default function InscribeDropMintConfigEntry(props: {
  onMintConfigChanged: (mintConfig: MintConfig) => void;
}) {
  const [maxSupply, setMaxSupply] = useState<string>("");
  const [priceInEth, setPriceInEth] = useState<string>("");
  const [mintEndTimestamp, setMintEndTimestamp] = useState<string>("");

  function Spacing() {
    return <div className="mt-4" />;
  }

  function updateMintConfig(params: {
    maxSupply: string;
    priceInEth: string;
    mintEndTimestamp: string;
  }) {
    try {
      const final = {
        maxSupply:
          params.maxSupply.length > 0 ? parseInt(params.maxSupply) : undefined,
        priceInEth:
          params.priceInEth.length > 0
            ? parseFloat(params.priceInEth)
            : undefined,
        mintEndTimestamp:
          // TODO allow date as entry and convert from date to timestamp
          params.mintEndTimestamp.length > 0
            ? parseInt(params.mintEndTimestamp)
            : undefined,
      };
      props.onMintConfigChanged(final);
    } catch (e) {}
  }

  return (
    <>
      <Label>Mint price (in ETH, enter nothing for free):</Label>
      <Input
        onChange={(e) => {
          const updated = e.target.value;
          setPriceInEth(updated);
          updateMintConfig({
            priceInEth: updated,
            maxSupply,
            mintEndTimestamp,
          });
        }}
        value={priceInEth}
        placeholder="Default is 0 ETH (free)"
      />
      <Spacing />
      <Label>Max supply (enter nothing for open edition):</Label>
      <Textarea
        onChange={(e) => {
          const updated = e.target.value;
          setMaxSupply(updated);
          updateMintConfig({
            priceInEth,
            maxSupply: updated,
            mintEndTimestamp,
          });
        }}
        value={maxSupply}
        placeholder="Default is open edition"
      />
      <Spacing />
      <Label>Mint end timestamp (enter nothing for open forever):</Label>
      <Textarea
        contentEditable
        onChange={(e) => {
          const updated = e.target.value;
          setMintEndTimestamp(updated);
          updateMintConfig({
            priceInEth,
            maxSupply,
            mintEndTimestamp: updated,
          });
        }}
        value={mintEndTimestamp}
        placeholder="Default is open forever"
      />
    </>
  );
}