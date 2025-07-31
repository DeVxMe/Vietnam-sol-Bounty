"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import React from 'react';

export function ConnectWalletButton() {
  const { connected } = useWallet();

  return (
    <div className="flex items-center justify-center">
      <WalletMultiButton
        className={`wallet-adapter-button-trigger ${
          connected ? 'wallet-adapter-button-connected' : ''
        }`}
      >
        {connected ? 'Connected' : 'Connect Wallet'}
      </WalletMultiButton>
    </div>
  );
}