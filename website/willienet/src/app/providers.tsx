"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import {
  argentWallet,
  trustWallet,
  ledgerWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { base, baseSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { testnetsEnabled } from "./constants";

const { wallets } = getDefaultWallets();

const config = getDefaultConfig({
  appName: "WillieNet Dapp",
  // TODO move to env var
  projectId: "e30601719b43774a0f0ba554aa131083",
  wallets: [
    {
      groupName: "Other",
      wallets: [walletConnectWallet, argentWallet, trustWallet, ledgerWallet],
    },
    ...wallets,
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
