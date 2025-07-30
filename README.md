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
