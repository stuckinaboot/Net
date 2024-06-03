import { NULL_ADDRESS, TESTNETS_ENABLED } from "@/app/constants";
import { base, baseSepolia } from "viem/chains";
import { isAddress, parseEther } from "viem";

type SwapCurrency = { symbol: string; name: string; address: string };

// TODO support more chains
const SWAP_CHAIN_ID = TESTNETS_ENABLED ? baseSepolia.id : base.id;

// TODO support multiple chains, as these addresses could differ across chains
// (ex. weth address is different on different chains)
const CURRENCY_NAME_TO_ADDRESS: { [symbol: string]: string } = {
  eth: NULL_ADDRESS,
  ethereum: NULL_ADDRESS,
  degen: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
  bleu: "0xBf4Db8b7A679F89Ef38125d5F84dd1446AF2ea3B",
  tn100x: "0x5B5dee44552546ECEA05EDeA01DCD7Be7aa6144A",
  weth: "0x4200000000000000000000000000000000000006",
  usdc: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  ror: "0x9e13480a81af1dea2f255761810ef8d6cbf21735",
};

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
    const amount = parseEther(parts[1]);
    const fromCurrencyNameOrAddress = parts[2];
    const fromCurrencyAddress =
      CURRENCY_NAME_TO_ADDRESS[fromCurrencyNameOrAddress] != null
        ? CURRENCY_NAME_TO_ADDRESS[fromCurrencyNameOrAddress]
        : fromCurrencyNameOrAddress;
    if (!isAddress(fromCurrencyAddress)) {
      return;
    }
    if (parts[3] !== "to") {
      return;
    }
    const toCurrencyNameOrAddress = parts[4];
    const toCurrencyAddress =
      CURRENCY_NAME_TO_ADDRESS[toCurrencyNameOrAddress] != null
        ? CURRENCY_NAME_TO_ADDRESS[toCurrencyNameOrAddress]
        : toCurrencyNameOrAddress;
    if (!isAddress(toCurrencyAddress)) {
      return;
    }
    return {
      from: {
        currency: {
          symbol: "TODO",
          name: fromCurrencyNameOrAddress,
          address: fromCurrencyAddress,
        },
        chainId: SWAP_CHAIN_ID,
        amount: amount.toString(),
      },
      to: {
        currency: {
          symbol: "TODO",
          name: toCurrencyNameOrAddress,
          address: toCurrencyAddress,
        },
        chainId: SWAP_CHAIN_ID,
      },
    };
  } catch (e) {
    return;
  }
}
