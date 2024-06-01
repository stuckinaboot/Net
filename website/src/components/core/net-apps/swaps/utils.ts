export type Swap = {
  from: { currency: string; chainId: number; amount: string };
  to: { currency: string; chainId: number; amount: string };
};

export function parseMessageToSwap(message: string): Swap | undefined {
  return undefined;
}
