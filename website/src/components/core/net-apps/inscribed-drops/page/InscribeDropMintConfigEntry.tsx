import DatetimePicker from "@/components/ui/DatetimePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export type MintConfig = {
  maxSupply?: number;
  priceInEth?: number;
  mintEndTimestamp?: number;
};

// Same as MintConfig except all fields non-optional
export type MintConfigDefined = {
  maxSupply: number;
  priceInEth: number;
  mintEndTimestamp: number;
};

export default function InscribeDropMintConfigEntry(props: {
  onMintConfigChanged: (mintConfig: MintConfig) => void;
}) {
  const [maxSupply, setMaxSupply] = useState<string>("");
  const [priceInEth, setPriceInEth] = useState<string>("");
  const [mintEndDate, setMintEndDate] = useState(new Date());
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
      <Label>
        <b>Mint price in ETH (Optional):</b>
      </Label>
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
        placeholder="Leave empty for 0 ETH (free)"
      />
      <Spacing />
      <Label>
        <b>Max supply (Optional):</b>
      </Label>
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
        placeholder="Leave empty for open edition"
      />
      <Spacing />
      <Label>
        <b>Mint end block timestamp (Optional):</b>
      </Label>
      <Spacing />
      {/* TODO include toggle datetime picker on/off */}
      {/* Justify center on small screens since otherwise the date picker UI gets cut off.
          On larger screens, justify start because it looks nicer */}
      <div className="flex justify-center md:justify-start">
        <DatetimePicker
          selected={mintEndDate}
          onChange={(date) => {
            setMintEndDate(date);
            updateMintConfig({
              priceInEth,
              maxSupply,
              mintEndTimestamp: Math.ceil(
                // Get time returns milliseconds but we expect time in seconds so
                // divide by 1000
                mintEndDate.getTime() / 1000
              ).toString(),
            });
          }}
        />
      </div>
    </>
  );
}
