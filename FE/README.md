# Middleware Program Interface

This frontend application provides a user interface for interacting with the Middleware Solana program. The middleware acts as an intermediary layer that enhances token swap functionality on Raydium by adding transfer hook validation before executing swaps.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Usage](#usage)
- [Program Logic](#program-logic)
  - [Cross-Program Invocation (CPI)](#cross-program-invocation-cpi)
  - [Raydium Pool Creation](#raydium-pool-creation)
  - [Transfer Hook Validation](#transfer-hook-validation)
- [Development](#development)

## Overview

The Middleware Program Interface is a React-based frontend application that allows users to:

1. Initialize and manage a middleware account on the Solana blockchain
2. Add whitelisted transfer hook programs
3. Create Raydium liquidity pools
4. Execute token swaps with transfer hook validation

This application connects to the Solana Devnet network and provides a user-friendly interface for interacting with the Middleware program deployed on-chain.

## Key Features

- **Wallet Integration**: Connect your Solana wallet (Phantom, Solflare, etc.) to interact with the program
- **Middleware Management**: Initialize and configure middleware accounts
- **Hook Whitelisting**: Add trusted transfer hook programs to the whitelist
- **Pool Creation**: Create new liquidity pools on Raydium through the middleware
- **Swap Execution**: Execute token swaps with built-in transfer hook validation
- **Real-time Pricing**: View live token prices from CoinGecko API

## How It Works

The middleware program acts as a proxy between users and the Raydium AMM program. When executing a swap, the middleware:

1. Validates the transfer hook to ensure compliance with token transfer rules
2. If validation passes, executes the swap via Cross-Program Invocation (CPI) to Raydium
3. All transactions are signed by the user's wallet

This approach ensures that token transfers comply with any additional validation rules while still leveraging Raydium's liquidity.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Solana wallet (Phantom, Solflare, etc.)
- Solana CLI tools (optional, for development)

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd FE
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## Usage

1. **Connect Wallet**: Click the "Select Wallet" button in the header to connect your Solana wallet

2. **Initialize Middleware**: Click "Initialize Middleware" to create your middleware account

3. **Add Whitelisted Hook**: Enter a hook program ID and click "Add Whitelisted Hook" to register a trusted transfer hook

4. **Create Raydium Pool**: Fill in the pool creation parameters and click "Create Raydium Pool"

5. **Execute Swap**: Enter swap parameters and click "Execute Swap" to perform a token swap with hook validation
