import React, { useState } from 'react';

interface SwapInterfaceProps {
  onSwap: (data: any) => void;
  loading: boolean;
}

export default function SwapInterface({ onSwap, loading }: SwapInterfaceProps) {
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
    onSwap(swapData);
  };

  return (
    <div className="bg-indigo-800/30 backdrop-blur-sm rounded-xl p-6 border border-indigo-700/50">
      <h2 className="text-2xl font-bold mb-4">Swap Tokens</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="fromToken">
            From
          </label>
          <select
            id="fromToken"
            name="fromToken"
            value={swapData.fromToken}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="SOL">SOL</option>
            <option value="USDC">USDC</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="amount">
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
            className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="0.0"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2" htmlFor="toToken">
            To
          </label>
          <input
            id="toToken"
            name="toToken"
            type="text"
            value={swapData.toToken}
            onChange={handleChange}
            className="w-full px-3 py-2 bg-indigo-900/50 border border-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Token address"
            required
          />
        </div>

        <div className="mb-4 p-3 bg-indigo-900/30 rounded-lg">
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
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-4 py-2 rounded-lg transition"
        >
          {loading ? 'Swapping...' : 'Swap'}
        </button>
      </form>
    </div>
  );
}