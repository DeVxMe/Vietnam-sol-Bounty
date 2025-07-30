# 🧩 Token-2022 Transfer Hooks AMM

> Make Token-2022 tokens with Transfer Hooks tradable on Solana AMMs  
> **Bounty Deadline:** July 31st, 2025  
> **Prizes:** 🥇 $2,000 | 🥈 $1,000 | 🥉 $500

---

## 📖 Overview

**Token-2022** is a Solana SPL token standard upgrade that enables:

- ✅ Transfer Hooks for KYC/whitelisting  
- ✅ Conditional transfers  
- ✅ Tokenized real-world assets (RWA)  

**Problem:**  
Currently, no major Solana AMMs (Raydium, Orca, Meteora) can **trade Token-2022 tokens with Transfer Hooks**, because swaps fail if hooks reject transfers.

**Objective:**  
Build a system that **enables safe trading** of Token-2022 tokens with Transfer Hooks on Solana AMMs.

---

## 🎯 Project Goal

1. **Create a Token-2022 token with a Transfer Hook**
2. **Create an LP pool (SOL/TOKEN-2022)**
3. **Enable successful swaps on an AMM**

We achieve this by either:

1. **Building a new AMM** that supports Transfer Hooks  
2. **Patching an existing AMM** (Orca / Raydium / Meteora) to support hook checks

---

## 🧠 Core Idea

We add a **middleware layer** between the user and the AMM:

1. **Simulate Transfer Hook** before executing the swap  
2. **Whitelist safe hook programs** to prevent exploits  
3. **Forward swap** to the AMM if the hook approves

If the hook rejects → transaction is reverted safely.

---

## 🔄 Workflow

```plaintext
[1] User opens dApp
        |
        v
   Create Token-2022
 (with Transfer Hook)
        |
        v
   Create LP Pool
 (SOL/TOKEN-2022)
        |
        v
    User tries swap
        |
        v
  Middleware / Patched AMM
        |
   (Pre-Transfer Check)
        |
  Simulate Transfer Hook
    └─> Hook approves? ✅ Yes
                       ❌ No → Revert
        |
        v
  Execute Swap on AMM
        |
        v
    Tokens Transferred



🛠 Tech Stack
Smart Contracts: Anchor + Solana Program Library (SPL Token-2022)

Frontend: React / Next.js + TypeScript + TailwindCSS

AMM Reference:

Raydium

Orca

Meteora

Network: Solana Devnet/Testnet

📂 Project Structure
plaintext
Copy
Edit
project-root/
├── programs/              # Anchor programs
│   └── middleware/        # Middleware program for hook checks
├── app/                   # React/Next.js frontend
│   ├── pages/             # Swap, LP creation, Token creation
│   └── components/        # UI components
├── scripts/               # Token creation, LP setup scripts
├── tests/                 # Anchor + TypeScript tests
├── README.md              # This file
└── package.json
🚀 Features
✅ Create Token‑2022 tokens with Transfer Hooks

✅ Whitelist and validate Transfer Hook programs

✅ Simulate transfers before swaps

✅ Trade Token‑2022 on Solana AMM safely

✅ Full UI for token creation, LP pool setup, and trading

