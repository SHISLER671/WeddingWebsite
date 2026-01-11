"use client";

import React from 'react';
import { AbstractWalletProvider } from "@abstract-foundation/agw-react";
import { abstractTestnet } from "viem/chains";
import { ChatProvider } from "@/contexts/ChatContext";
import { MusicProvider } from "@/contexts/MusicContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AbstractWalletProvider chain={abstractTestnet}>
      <ChatProvider>
        <MusicProvider>
          {children}
        </MusicProvider>
      </ChatProvider>
    </AbstractWalletProvider>
  );
}
