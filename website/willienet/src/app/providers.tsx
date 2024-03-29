"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
  connectorsForWallets,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
  walletConnectWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { testnetsEnabled } from "./constants";

// const connectors = connectorsForWallets(
//   [
//     {
//       groupName: "Recommended",
//       wallets: [
//         metaMaskWallet,
//         rainbowWallet,
//         coinbaseWallet,
//         walletConnectWallet,
//       ],
//     },
//   ],
//   {
//     appName: "WillieNet Dapp",
//     projectId: "e30601719b43774a0f0ba554aa131083",
//   }
// );

// const config2 = createConfig({
//   connectors,
//   chains: testnetsEnabled ? [baseSepolia] : [base],
//   ssr: true,
//   transports: {
//     [base.id]: http(),
//     [baseSepolia.id]: http(),
//   },
// });

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "WillieNet Dapp",
  projectId: "e30601719b43774a0f0ba554aa131083",
  wallets: [
    ...wallets,
    {
      groupName: "Other",
      wallets: [argentWallet, trustWallet, ledgerWallet],
    },
  ],
  chains: testnetsEnabled ? [baseSepolia] : [base],
  ssr: true,
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
