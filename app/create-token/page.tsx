"use client";

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolanaOperations } from '../components/SolanaOperations';

export default function CreateTokenPage() {
  const { connected } = useWallet();
  const { loading, createTokenWithTransferHook } = useSolanaOperations();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    decimals: 9,
    initialSupply: 1000000,
    hasTransferHook: true,
    hookProgram: '7rPx2YD8zuQG1owdEp7mYtqgTzDpwe9qt8rnPVJAFc4D',
  });
  const [result, setResult] = useState<{success: boolean, message: string, mintAddress?: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData({
      ...formData,
      [name]: name === 'decimals' || name === 'initialSupply' ? Number(val) : val,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected) {
      setResult({ success: false, message: "Please connect your wallet first" });
      return;
    }
    
    try {
      const hookProgramId = formData.hasTransferHook ? formData.hookProgram : "";
      const result = await createTokenWithTransferHook(
        formData.name,
        formData.symbol,
        formData.decimals,
        formData.initialSupply,
        hookProgramId
      );
      
      if (result.success) {
        setResult({
          success: true,
          message: `Token created successfully! Mint address: ${result.mintAddress}`,
          mintAddress: result.mintAddress
        });
      } else {
        setResult({ success: false, message: `Error creating token: ${result.error}` });
      }
    } catch (error) {
      console.error('Error creating token:', error);
      setResult({ success: false, message: 'Error creating token. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary-400">
            Create Token-2022 with Transfer Hook
          </h1>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Create tokens with custom transfer logic for KYC, whitelisting, or other conditions
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Token Configuration</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label" htmlFor="name">
                  Token Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="My Token"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="symbol">
                  Symbol
                </label>
                <input
                  id="symbol"
                  name="symbol"
                  type="text"
                  value={formData.symbol}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="TKN"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="decimals">
                  Decimals
                </label>
                <input
                  id="decimals"
                  name="decimals"
                  type="number"
                  min="0"
                  max="18"
                  value={formData.decimals}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="initialSupply">
                  Initial Supply
                </label>
                <input
                  id="initialSupply"
                  name="initialSupply"
                  type="number"
                  min="1"
                  value={formData.initialSupply}
                  onChange={handleChange}
                  className="input w-full"
                  required
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  id="hasTransferHook"
                  name="hasTransferHook"
                  type="checkbox"
                  checked={formData.hasTransferHook}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary-600 bg-dark-800 border-dark-700 rounded focus:ring-primary-500"
                />
                <label className="ml-2 block text-sm font-medium" htmlFor="hasTransferHook">
                  Enable Transfer Hook
                </label>
              </div>

              {formData.hasTransferHook && (
                <div className="mb-4">
                  <label className="form-label" htmlFor="hookProgram">
                    Hook Program Address
                  </label>
                  <input
                    id="hookProgram"
                    name="hookProgram"
                    type="text"
                    value={formData.hookProgram}
                    onChange={handleChange}
                    className="input w-full"
                    placeholder="Hook program address"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Creating...' : 'Create Token'}
              </button>
            </form>
            
            {result && (
              <div className={`mt-4 p-4 rounded ${result.success ? 'bg-green-900/30 border border-green-700/50' : 'bg-red-900/30 border border-red-700/50'}`}>
                <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                  {result.message}
                </p>
                {result.mintAddress && (
                  <p className="mt-2 text-sm">
                    View on Solana Explorer:
                    <a
                      href={`https://explorer.solana.com/address/${result.mintAddress}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-400 hover:underline ml-1"
                    >
                      {result.mintAddress}
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="card mt-8">
            <h3 className="text-xl font-bold mb-4">About Transfer Hooks</h3>
            <p className="mb-3 text-dark-300">
              Transfer Hooks allow you to add custom logic that executes during token transfers.
              This can be used for:
            </p>
            <ul className="list-disc list-inside text-dark-300 space-y-2">
              <li>KYC/AML compliance checks</li>
              <li>Whitelisting of approved addresses</li>
              <li>Geographic restrictions</li>
              <li>Time-based transfer restrictions</li>
              <li>Fee collection on transfers</li>
            </ul>
            <p className="mt-4 text-dark-300">
              Our middleware ensures these hooks are validated before executing swaps on AMMs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}