"use client";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction, SystemProgram, Transaction as Web3Transaction, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { Middleware } from '../../target/types/middleware';
import { Program, AnchorProvider, Idl, BN } from '@coral-xyz/anchor';
import { useState } from 'react';
import { createMint, getMint, getAccount, TOKEN_2022_PROGRAM_ID, ExtensionType, getTransferHook, updateTransferHook, createInitializeTransferHookInstruction, createInitializeMintInstruction, createAssociatedTokenAccountInstruction, createMintToInstruction, getAssociatedTokenAddress } from '@solana/spl-token';
import middlewareIdl from '../../target/idl/middleware.json';

// Middleware program ID
const MIDDLEWARE_PROGRAM_ID = new PublicKey("7rPx2YD8zuQG1owdEp7mYtqgTzDpwe9qt8rnPVJAFc4D");

// Raydium AMM program ID
const RAYDIUM_AMM_PROGRAM_ID = new PublicKey("DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav");

export function useSolanaOperations() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  // Initialize the middleware program
  const getMiddlewareProgram = () => {
    if (!publicKey) return null;
    
    const provider = new AnchorProvider(connection, {
      publicKey,
      signAllTransactions: (transactions: Web3Transaction[]) => Promise.resolve(transactions),
      signTransaction: (transaction: Web3Transaction) => Promise.resolve(transaction),
    } as any, {
      commitment: 'confirmed',
    });
    
    // Load the program with the IDL
    return new Program(middlewareIdl as any, MIDDLEWARE_PROGRAM_ID, provider);
  };

  // Create a new Token-2022 with Transfer Hook
  const createTokenWithTransferHook = async (
    name: string,
    symbol: string,
    decimals: number,
    initialSupply: number,
    hookProgramId: string
  ) => {
    if (!publicKey) return { success: false, error: "Wallet not connected" };
    
    setLoading(true);
    try {
      // Create a new mint account for Token-2022
      const mintKeypair = Keypair.generate();
      
      // Create the mint account with Token-2022 program
      // First, create the account for the mint
      const mintAccount = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: publicKey,
          newAccountPubkey: mintKeypair.publicKey,
          space: 82, // Mint account space
          lamports: await connection.getMinimumBalanceForRentExemption(82),
          programId: TOKEN_2022_PROGRAM_ID,
        })
      );
      
      // Partially sign the transaction with the mint keypair
      mintAccount.partialSign(mintKeypair);
      
      // Send the transaction to create the mint account
      const signature = await sendTransaction(mintAccount, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      // Initialize the mint
      const initMintTx = new Transaction().add(
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          publicKey,
          publicKey,
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Send the transaction to initialize the mint
      const initSignature = await sendTransaction(initMintTx, connection);
      await connection.confirmTransaction(initSignature, 'confirmed');
      
      const mint = mintKeypair.publicKey;
      
      // Add transfer hook to the mint
      if (hookProgramId) {
        const hookProgramPubkey = new PublicKey(hookProgramId);
        
        // Create transaction to add transfer hook
        const transaction = new Transaction().add(
          createInitializeTransferHookInstruction(
            mint,
            publicKey,
            hookProgramPubkey,
            TOKEN_2022_PROGRAM_ID
          )
        );
        
        // Send the transaction
        const signature = await sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'confirmed');
        
        console.log("Transfer hook added to mint:", mint.toBase58());
      }
      
      // Mint initial supply to the creator's wallet
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      // Create the token account
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      
      // Create the associated token account if it doesn't exist
      const accountInfo = await connection.getAccountInfo(tokenAccount);
      if (!accountInfo) {
        const createAccountTx = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            publicKey,
            tokenAccount,
            publicKey,
            mint,
            TOKEN_2022_PROGRAM_ID
          )
        );
        
        // Send the transaction to create the associated token account
        const createAccountSignature = await sendTransaction(createAccountTx, connection);
        await connection.confirmTransaction(createAccountSignature, 'confirmed');
      }
      
      // Mint tokens to the user's account
      const mintToTx = new Transaction().add(
        createMintToInstruction(
          mint,
          tokenAccount,
          publicKey,
          initialSupply,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      
      // Send the transaction to mint tokens
      const mintToSignature = await sendTransaction(mintToTx, connection);
      await connection.confirmTransaction(mintToSignature, 'confirmed');
      
      console.log("Token created with mint address:", mint.toBase58());
      console.log("User token account:", userTokenAccount.toBase58());
      
      setLoading(false);
      return { success: true, mintAddress: mint.toBase58() };
    } catch (error: any) {
      console.error("Error creating token:", error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Initialize middleware account
  const initializeMiddleware = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // This would be the actual implementation using the IDL
      console.log("Initializing middleware account");
      
      // In a real implementation:
      // 1. Load the program with the IDL
      // 2. Generate a new middleware account keypair
      // 3. Call the initialize instruction
      // 4. Send the transaction
      
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error("Error initializing middleware:", error);
      setLoading(false);
      return { success: false, error };
    }
  };

  // Add whitelisted hook
  const addWhitelistedHook = async (hookProgramId: string) => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      console.log("Adding whitelisted hook:", hookProgramId);
      
      // In a real implementation:
      // 1. Load the program with the IDL
      // 2. Call the addWhitelistedHook instruction
      // 3. Send the transaction
      
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error("Error adding whitelisted hook:", error);
      setLoading(false);
      return { success: false, error };
    }
  };

  // Execute swap with hook check
  const executeSwapWithHookCheck = async (
    sourceAccount: string,
    mintAccount: string,
    destinationAccount: string,
    hookProgram: string,
    amountIn: number,
    minAmountOut: number,
    decimals: number,
    raydiumAccounts: any
  ) => {
    if (!publicKey) return { success: false, error: "Wallet not connected" };
    
    setLoading(true);
    try {
      // Load the middleware program
      const program = getMiddlewareProgram();
      if (!program) {
        throw new Error("Unable to load middleware program");
      }
      
      // Derive the middleware PDA
      const [middlewarePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("middleware")],
        program.programId
      );
      
      // Prepare accounts for the instruction
      const accounts = {
        sourceAccount: new PublicKey(sourceAccount),
        mintAccount: new PublicKey(mintAccount),
        destinationAccount: new PublicKey(destinationAccount),
        authority: publicKey,
        hookProgram: new PublicKey(hookProgram),
        raydiumSwapProgram: new PublicKey(raydiumAccounts.raydiumSwapProgram),
        ammAuthority: new PublicKey(raydiumAccounts.ammAuthority),
        ammOpenOrders: new PublicKey(raydiumAccounts.ammOpenOrders),
        ammTargetOrders: new PublicKey(raydiumAccounts.ammTargetOrders),
        poolSourceTokenAccount: new PublicKey(raydiumAccounts.poolSourceTokenAccount),
        poolDestinationTokenAccount: new PublicKey(raydiumAccounts.poolDestinationTokenAccount),
        userSourceTokenAccount: new PublicKey(raydiumAccounts.userSourceTokenAccount),
        userDestinationTokenAccount: new PublicKey(raydiumAccounts.userDestinationTokenAccount),
        serumMarket: new PublicKey(raydiumAccounts.serumMarket),
        serumEventQueue: new PublicKey(raydiumAccounts.serumEventQueue),
        serumBids: new PublicKey(raydiumAccounts.serumBids),
        serumAsks: new PublicKey(raydiumAccounts.serumAsks),
        serumCoinVault: new PublicKey(raydiumAccounts.serumCoinVault),
        serumPcVault: new PublicKey(raydiumAccounts.serumPcVault),
        serumVaultSigner: new PublicKey(raydiumAccounts.serumVaultSigner),
        tokenProgram: new PublicKey(raydiumAccounts.tokenProgram),
        rent: new PublicKey(raydiumAccounts.rent),
        middlewarePda: middlewarePda,
      };
      
      // Call the executeSwapWithHookCheck instruction
      const tx = await program.methods
        .executeSwapWithHookCheck(
          new BN(amountIn),
          new BN(minAmountOut),
          decimals
        )
        .accounts(accounts)
        .rpc();
      
      setLoading(false);
      return { success: true, signature: tx };
    } catch (error: any) {
      console.error("Error executing swap:", error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    createTokenWithTransferHook,
    initializeMiddleware,
    addWhitelistedHook,
    executeSwapWithHookCheck
  };
}