import DatetimePicker from "@/components/ui/DatetimePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import MintEndTimestampPicker from "./MintEndTimestampPicker";

export type MintConfig = {
  maxSupply?: number;
  priceInEth?: number;
  mintEndTimestamp?: number;
  maxMintsPerWallet?: number;
};

// Same as MintConfig except all fields non-optional
export type MintConfigDefined = {
  maxSupply: number;
  priceInEth: number;
  mintEndTimestamp: number;
  maxMintsPerWallet: number;
};

export default function InscribeDropMintConfigEntry(props: {
  onMintConfigChanged: (mintConfig: MintConfig) => void;
}) {
  const [maxSupply, setMaxSupply] = useState<string>("");
  const [priceInEth, setPriceInEth] = useState<string>("");
  const [mintEndDate, setMintEndDate] = useState<Date | undefined>(undefined);
  const [maxMintsPerWallet, setMaxMintsPerWallet] = useState<string>("");

  function Spacing() {
    return <div className="mt-4" />;
  }

  function updateMintConfig(params: {
    maxSupply: string;
    priceInEth: string;
    mintEndTimestamp: string;
    maxMintsPerWallet: string;
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
          params.mintEndTimestamp.length > 0
            ? parseInt(params.mintEndTimestamp)
            : undefined,
        maxMintsPerWallet:
          params.maxMintsPerWallet.length > 0
            ? parseInt(params.maxMintsPerWallet)
            : undefined,
      };
      props.onMintConfigChanged(final);
    } catch (e) {}
  }

  function mintEndDateToMintEndTimestamp(date?: Date) {
    return date != null
      ? Math.ceil(
          // Get time returns milliseconds but we expect time in seconds so
          // divide by 1000
          date.getTime() / 1000
        ).toString()
      : "0";
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
            mintEndTimestamp: mintEndDateToMintEndTimestamp(mintEndDate),
            maxMintsPerWallet,
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
            mintEndTimestamp: mintEndDateToMintEndTimestamp(mintEndDate),
            maxMintsPerWallet,
          });
        }}
        value={maxSupply}
        placeholder="Leave empty for open edition"
      />
      <Spacing />
      <Label>
        <b>Max mints per wallet (Optional):</b>
      </Label>
      <Textarea
        onChange={(e) => {
          const updated = e.target.value;
          setMaxMintsPerWallet(updated);
          updateMintConfig({
            priceInEth,
            maxSupply,
            mintEndTimestamp: mintEndDateToMintEndTimestamp(mintEndDate),
            maxMintsPerWallet: updated,
          });
        }}
        value={maxMintsPerWallet}
        placeholder="Leave empty for unlimited mints per wallet"
      />
      <Spacing />
      <Label>
        <b>Mint end block timestamp (Optional):</b>
      </Label>
      <Spacing />
      <MintEndTimestampPicker
        value={mintEndDate}
        onChange={(date) => {
          setMintEndDate(date);
          updateMintConfig({
            priceInEth,
            maxSupply,
            mintEndTimestamp:
              // Use date rather than mintEndDate in case mintEndDate hasn't updated yet
              mintEndDateToMintEndTimestamp(date),
            maxMintsPerWallet,
          });
        }}
      />
    </>
  );
}
