"use client";

import React, { useState } from 'react';

export default function CreatePoolPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tokenA: 'SOL',
    tokenB: '',
    amountA: 0,
    amountB: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: name === 'amountA' || name === 'amountB' ? Number(value) : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Here we would implement the actual pool creation logic
      console.log('Creating pool with data:', formData);
      
      // Simulate API call
      setTimeout(() => {
        alert('Pool created successfully!');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Error creating pool:', error);
      alert('Error creating pool. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-primary-400">
            Create Liquidity Pool
          </h1>
          <p className="text-lg text-dark-300 max-w-2xl mx-auto">
            Create liquidity pools with your Token-2022 tokens and SOL
          </p>
        </header>

        <div className="max-w-2xl mx-auto">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Pool Configuration</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label" htmlFor="tokenA">
                  Token A
                </label>
                <select
                  id="tokenA"
                  name="tokenA"
                  value={formData.tokenA}
                  onChange={handleChange}
                  className="input w-full"
                >
                  <option value="SOL">SOL</option>
                  <option value="USDC">USDC</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="amountA">
                  Amount A
                </label>
                <input
                  id="amountA"
                  name="amountA"
                  type="number"
                  min="0"
                  step="0.000000001"
                  value={formData.amountA}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0.0"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="tokenB">
                  Token B (Token-2022)
                </label>
                <input
                  id="tokenB"
                  name="tokenB"
                  type="text"
                  value={formData.tokenB}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Token address"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="amountB">
                  Amount B
                </label>
                <input
                  id="amountB"
                  name="amountB"
                  type="number"
                  min="0"
                  step="0.000000001"
                  value={formData.amountB}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0.0"
                  required
                />
              </div>

              <div className="mb-4 card bg-dark-700">
                <div className="flex justify-between text-sm">
                  <span>Pool Ratio</span>
                  <span>1 SOL = 0.00 TOKEN</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Your Pool Share</span>
                  <span>0.00%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>LP Tokens to Receive</span>
                  <span>0.00 LP</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.tokenB}
                className="btn-primary w-full"
              >
                {loading ? 'Creating...' : 'Create Pool'}
              </button>
            </form>
          </div>
          
          <div className="card mt-8">
            <h3 className="text-xl font-bold mb-4">Liquidity Pool Benefits</h3>
            <ul className="list-disc list-inside text-dark-300 space-y-2">
              <li>Earn trading fees from swaps in your pool</li>
              <li>Provide liquidity for Token-2022 tokens with Transfer Hooks</li>
              <li>Our middleware ensures safe trading with hook validation</li>
              <li>Automatic reinvestment of fees</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}