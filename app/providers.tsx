"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { ChatProvider } from "@/contexts/ChatContext";
import { wagmiConfig } from "@/lib/wagmi-config";

// Create a query client for wagmi
const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AbstractWalletProvider chain={abstractTestnet}>
          <ChatProvider>
            {children}
          </ChatProvider>
        </AbstractWalletProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
