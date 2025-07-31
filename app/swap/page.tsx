"use client";

import React, { useState } from 'react';
import { useSolanaOperations } from '../components/SolanaOperations';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export default function SwapPage() {
  const { loading, executeSwapWithHookCheck } = useSolanaOperations();
  const { connected, publicKey } = useWallet();
  const [result, setResult] = useState<{success: boolean, message: string, signature?: string} | null>(null);
  
  const [swapData, setSwapData] = useState({
    fromToken: 'SOL',
    toToken: '',
    amount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setSwapData({
      ...swapData,
      [name]: name === 'amount' ? Number(value) : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      setResult({ success: false, message: "Please connect your wallet first" });
      return;
    }
    
    try {
      // In a real implementation, you would fetch these values from the UI or from on-chain data
      // For demo purposes, we're using placeholder values
      const sourceAccount = publicKey?.toBase58() || ''; // User's wallet as source
      const mintAccount = swapData.toToken; // The token being swapped
      const destinationAccount = publicKey?.toBase58() || ''; // User's wallet as destination
      const hookProgram = '7rPx2YD8zuQG1owdEp7mYtqgTzDpwe9qt8rnPVJAFc4D'; // Middleware program as hook
      const amountIn = swapData.amount * 1000000000; // Assuming 9 decimals
      const minAmountOut = amountIn * 0.95; // 5% slippage
      const decimals = 9;
      
      // Raydium accounts (in a real implementation, you would fetch these from Raydium)
      const raydiumAccounts = {
        raydiumSwapProgram: "DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav",
        ammAuthority: "5Q544fKrFoe6JVtwGTjDMmF8476xyc1hRyY7EJ4u85C3",
        ammOpenOrders: "CRXx86MfFvhpALsRj9YL5yG73SNh7173aPj7ESbfY1hc",
        ammTargetOrders: "3HUZGXMpJ3R5nr4gkH6XwNkGHvbsXFej1CzyCYREwKJu",
        poolSourceTokenAccount: "G3Xxy4s2GK6sXSn6FH87UWFVTUtJ43Qr9mtXjP6bP4BE",
        poolDestinationTokenAccount: "2sTMNkMEC3GnXXTxA2SVDiMD6X7dWTNbPR2xjDnfy7Jz",
        userSourceTokenAccount: sourceAccount,
        userDestinationTokenAccount: destinationAccount,
        serumMarket: "9wFFyRf675Pu7pCWJ4V99XHChZ59HpnLc4dR1sD5xk6y",
        serumEventQueue: "5KKYG1nsDjbvZD5SCNU1TBmXPJyJE89XXL752kvF5NGu",
        serumBids: "5kw41cVsRD8ycwznyqR87EL41pDHFUxaTmGDKeHS1AfF",
        serumAsks: "Hf84mYzb4CFR92UD6HzV5xKbTtWcRWMAdZPSh2Vt7YzZ",
        serumCoinVault: "Hv4xHLi6m7ZtTakvT5v6qD2CfTV125WPLhpNvZ4LmGvA",
        serumPcVault: "6AQk911oP4xdfFM7Nn1v2D1gqnmoJeJXQR99uiD4wZ59",
        serumVaultSigner: "CTiVQ7dWzYd2BRJF3nbgD9nBkNRXq3K175aJrJpxnnA5",
        tokenProgram: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
        rent: "SysvarRent111111111111111111111111111111111"
      };
      
      const result = await executeSwapWithHookCheck(
        sourceAccount,
        mintAccount,
        destinationAccount,
        hookProgram,
        amountIn,
        minAmountOut,
        decimals,
        raydiumAccounts
      );
      
      if (result?.success) {
        setResult({
          success: true,
          message: "Swap executed successfully!",
          signature: result.signature
        });
      } else {
        setResult({ success: false, message: `Error executing swap: ${result?.error || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      setResult({ success: false, message: `Error executing swap: ${(error as Error).message || 'Unknown error'}` });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary-400">
            Swap Tokens Safely
          </h1>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Our middleware validates Transfer Hooks before executing swaps to ensure safe trading
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Token Swap</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label" htmlFor="fromToken">
                  From
                </label>
                <select
                  id="fromToken"
                  name="fromToken"
                  value={swapData.fromToken}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="amount">
                  Amount
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.000000001"
                  value={swapData.amount}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0.0"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="toToken">
                  To
                </label>
                <input
                  id="toToken"
                  name="toToken"
                  type="text"
                  value={swapData.toToken}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Token address"
                  required
                />
              </div>

              <div className="mb-4 card bg-dark-700">
                <div className="flex justify-between text-sm">
                  <span>Rate</span>
                  <span>1 SOL = 0.00 TOKEN</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Price Impact</span>
                  <span>0.00%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Network Fee</span>
                  <span>0.00025 SOL</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !swapData.toToken}
                className="btn-primary w-full"
              >
                {loading ? 'Swapping...' : 'Swap'}
              </button>
            </form>
            
            {result && (
              <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'}`}>
                <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.message}
                </p>
                {result.signature && (
                  <p className="mt-2 text-sm">
                    View on Solana Explorer:
                    <a
                      href={`https://explorer.solana.com/tx/${result.signature}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:underline ml-1"
                    >
                      {result.signature}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="card mt-8">
            <h3 className="text-xl font-bold mb-4">How Middleware Validation Works</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-primary-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  1
                </div>
                <p className="text-dark-300">
                  <span className="font-medium">Pre-transfer Simulation:</span> Before executing the swap,
                  we simulate the transfer hook to check if it would approve the transaction
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  2
                </div>
                <p className="text-dark-300">
                  <span className="font-medium">Whitelist Validation:</span> We check if the transfer hook
                  program is in our whitelist of trusted hook programs
                </p>
              </div>
              <div className="flex items-start">
                <div className="bg-primary-600 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-1">
                  3
                </div>
                <p className="text-dark-300">
                  <span className="font-medium">Safe Execution:</span> Only if the hook approves, we proceed
                  with the swap on the AMM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}