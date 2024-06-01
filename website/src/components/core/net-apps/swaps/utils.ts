import { TESTNETS_ENABLED } from "@/app/constants";
import { base, baseSepolia } from "viem/chains";
import { isAddress } from "viem";

type SwapCurrency = { symbol: string; name: string; address: string };

// TODO support more chains
const SWAP_CHAIN_ID = TESTNETS_ENABLED ? baseSepolia.id : base.id;

export type Swap = {
  from: { currency: SwapCurrency; chainId: number; amount: string };
  to: { currency: SwapCurrency; chainId: number };
};

// TODO modify to support using symbols for conversion
export function parseMessageToSwap(message: string): Swap | undefined {
  try {
    const sanitizedMessage = message.trim().toLowerCase();
    // Split on whitespace
    const parts = sanitizedMessage.split(/\s+/);
    if (parts[0] !== "swap") {
      return undefined;
    }
    const amount = parseFloat(parts[1]);
    const fromCurrencyAddress = parts[2];
    if (!isAddress(fromCurrencyAddress)) {
      return;
    }
    if (parts[3] !== "to") {
      return;
    }
    const toCurrencyAddress = parts[4];
    if (!isAddress(toCurrencyAddress)) {
      return;
    }
    return {
      from: {
        currency: {
          symbol: "TODO",
          name: "TODO",
          address: fromCurrencyAddress,
        },
        chainId: SWAP_CHAIN_ID,
        amount: amount.toString(),
      },
      to: {
        currency: { symbol: "TODO", name: "TODO", address: toCurrencyAddress },
        chainId: SWAP_CHAIN_ID,
      },
    };
  } catch (e) {
    return;
  }
}
