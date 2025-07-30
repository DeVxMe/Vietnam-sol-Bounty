"use client";

import React from 'react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-primary-400">
            Token-2022 Transfer Hooks AMM
          </h1>
          <p className="text-xl text-dark-300 max-w-2xl mx-auto">
            Trade Token-2022 tokens with Transfer Hooks safely on Solana AMMs
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card hover:border-primary-500 transition-colors">
            <h2 className="text-2xl font-bold mb-4">Create Token</h2>
            <p className="mb-4 text-dark-300">
              Create Token-2022 tokens with Transfer Hooks for KYC/whitelisting
            </p>
            <a 
              href="/create-token" 
              className="btn-primary inline-block"
            >
              Create Token
            </a>
          </div>

          <div className="card hover:border-primary-500 transition-colors">
            <h2 className="text-2xl font-bold mb-4">Create LP Pool</h2>
            <p className="mb-4 text-dark-300">
              Create liquidity pools with your Token-2022 tokens
            </p>
            <a 
              href="/create-pool" 
              className="btn-primary inline-block"
            >
              Create Pool
            </a>
          </div>

          <div className="card hover:border-primary-500 transition-colors">
            <h2 className="text-2xl font-bold mb-4">Trade Tokens</h2>
            <p className="mb-4 text-dark-300">
              Swap tokens safely with Transfer Hook validation
            </p>
            <a 
              href="/swap" 
              className="btn-primary inline-block"
            >
              Trade Now
            </a>
          </div>
        </div>

        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold">Create Token-2022 with Transfer Hook</h3>
                <p className="text-dark-300">
                  Create tokens with custom transfer logic for KYC, whitelisting, or other conditions
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold">Create Liquidity Pool</h3>
                <p className="text-dark-300">
                  Add liquidity to pools with SOL and your Token-2022 tokens
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-primary-600 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold">Safe Trading with Middleware</h3>
                <p className="text-dark-300">
                  Our middleware validates transfer hooks before executing swaps
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}