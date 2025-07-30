"use client";

import React, { useState } from 'react';

export default function SwapPage() {
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Here we would implement the actual swap logic with middleware validation
      console.log('Swapping tokens with data:', swapData);
      
      // Simulate API call
      setTimeout(() => {
        alert('Swap executed successfully!');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error executing swap:', error);
      alert('Error executing swap. Please try again.');
      setLoading(false);
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