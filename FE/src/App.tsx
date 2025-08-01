import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createMint, TOKEN_2022_PROGRAM_ID, createInitializeTransferHookInstruction, getTransferHookAccount } from '@solana/spl-token';

//not used datas
import { Liquidity, Token as RaydiumToken, Currency } from '@raydium-io/raydium-sdk';
import idl from "../../target/idl/middleware.json";
import './App.css';

// Extract the program ID from the IDL
const MIDDLEWARE_PROGRAM_ID = new PublicKey(idl.address);

function App() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [program, setProgram] = useState<Program | null>(null);
  const [middlewareAccount, setMiddlewareAccount] = useState<PublicKey | null>(null);
  const [poolCreationStatus, setPoolCreationStatus] = useState<string>('');
  const [hookProgramId, setHookProgramId] = useState<string>('');
  const [ammProgramId, setAmmProgramId] = useState<string>("DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav");
  const [serumProgramId, setSerumProgramId] = useState<string>("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PstVekM");
  const [ammAuthorityNonce, setAmmAuthorityNonce] = useState<string>('0');
  const [amountIn, setAmountIn] = useState<string>('1000000'); // 1 token with 6 decimals
  const [minAmountOut, setMinAmountOut] = useState<string>('900000'); // 0.9 token with 6 decimals
  const [decimals, setDecimals] = useState<string>('6');
  const [tokenPrices, setTokenPrices] = useState<any>({});
  
  // Token-2022 minting state
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [tokenSupply, setTokenSupply] = useState<string>('');
  const [tokenDecimals, setTokenDecimals] = useState<string>('9');
  const [hasTransferHook, setHasTransferHook] = useState<boolean>(false);
  const [transferHookProgramId, setTransferHookProgramId] = useState<string>('');
  
  // Pool creation automation state
  const [tokenAMint, setTokenAMint] = useState<string>('');
  const [tokenBMint, setTokenBMint] = useState<string>('');
  const [tokenAAmount, setTokenAAmount] = useState<string>('');
  const [tokenBAmount, setTokenBAmount] = useState<string>('');

  // Initialize the program
  useEffect(() => {
    if (!connection || !publicKey || !wallet.signTransaction) return;

    try {
      const provider = new AnchorProvider(connection, wallet as any, {
        commitment: 'confirmed',
      });

      // Use the program ID from the IDL directly
      const programInstance = new Program(idl as any, provider);
      setProgram(programInstance);
      
      console.log("Program initialized with ID:", MIDDLEWARE_PROGRAM_ID.toString());
    } catch (error) {
      console.error("Error initializing program:", error);
      setPoolCreationStatus(`Error initializing program: ${error}`);
    }
  }, [connection, publicKey, wallet.signTransaction]);

  // Find middleware account
  useEffect(() => {
    if (!program || !publicKey) return;

    const findMiddlewareAccount = async () => {
      try {
        // Derive the middleware PDA based on the seeds from your IDL
        const [middlewarePda] = PublicKey.findProgramAddressSync(
          [Buffer.from("middleware")], // This matches the seeds in your IDL
          MIDDLEWARE_PROGRAM_ID
        );
        
        console.log("Middleware PDA:", middlewarePda.toString());
        setMiddlewareAccount(middlewarePda);
        
        // Check if the account exists
        const accountInfo = await connection.getAccountInfo(middlewarePda);
        if (accountInfo) {
          console.log("Middleware account already exists");
          setPoolCreationStatus("Middleware account found");
        } else {
          console.log("Middleware account needs to be initialized");
          setPoolCreationStatus("Middleware account needs initialization");
        }
      } catch (error) {
        console.error("Error finding middleware account:", error);
      }
    };

    findMiddlewareAccount();
  }, [program, publicKey, connection]);

  // Fetch token prices
  useEffect(() => {
    const fetchTokenPrices = async () => {
      try {
        // Using CoinGecko API for simplicity
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,bitcoin,ethereum&vs_currencies=usd');
        const data = await response.json();
        setTokenPrices(data);
      } catch (error) {
        console.error('Error fetching token prices:', error);
      }
    };

    fetchTokenPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchTokenPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  // Initialize middleware
  const initializeMiddleware = async () => {
    if (!program || !publicKey || !wallet.signTransaction) return;

    try {
      setPoolCreationStatus('Initializing middleware...');
      
      // Use a simple account, not a PDA for the middleware account
      // This matches your Initialize struct which uses `init` not `init_if_needed` with seeds
      const middlewareKeypair = web3.Keypair.generate();
      
      const tx = await program.methods
        .initialize()
        .accounts({
          middleware: middlewareKeypair.publicKey,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([middlewareKeypair])
        .transaction();

        tx.feePayer = publicKey;
      tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      setMiddlewareAccount(middlewareKeypair.publicKey);
      setPoolCreationStatus("Middleware initialized successfully!");
      console.log("Transaction Signature:", tx);

    } catch (error: any) {
      console.error("Error initializing middleware:", error);
      
      // Enhanced error logging
      if (error.logs) {
        console.error("Transaction logs:", error.logs);
      }
      
      setPoolCreationStatus(`Error: ${error.message}`);
    }
  };

  // Add whitelisted hook
  const addWhitelistedHook = async () => {
    if (!program || !publicKey || !middlewareAccount || !wallet.signTransaction) return;

    try {
      setPoolCreationStatus('Adding whitelisted hook...');
      
      if (!hookProgramId) {
        throw new Error("Please provide a hook program ID");
      }
      
      const hookProgram = new PublicKey(hookProgramId);
      
      const tx = await program.methods
        .addWhitelistedHook(hookProgram)
        .accounts({
          middleware: middlewareAccount,
          authority: publicKey,
        })
        .transaction();
      
      // Sign and send the transaction
      const signature = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      setPoolCreationStatus('Whitelisted hook added successfully!');
    } catch (error: any) {
      console.error("Error adding whitelisted hook:", error);
      setPoolCreationStatus(`Error: ${error.message}`);
    }
  };

  // Create Token-2022 with transfer hook
  const createToken2022 = async () => {
    if (!connection || !publicKey || !wallet.signTransaction) return;

    try {
      setPoolCreationStatus('Creating Token-2022...');
      
      // Create mint keypair
      const mintKeypair = web3.Keypair.generate();
      const mintAuthority = publicKey;
      const freezeAuthority = publicKey;
      
      // If transfer hook is enabled, we need to add it to the mint
      let transferHookProgramPubkey: PublicKey | undefined = undefined;
      if (hasTransferHook && transferHookProgramId) {
        transferHookProgramPubkey = new PublicKey(transferHookProgramId);
      }
      
      // Create the mint using the spl-token library
      const mint = await createMint(
        connection,
        mintKeypair, // Use the keypair as the payer
        mintAuthority,
        freezeAuthority,
        parseInt(tokenDecimals),
        mintKeypair, // Use the keypair for the mint account
        undefined, // Optional confirmation options
        TOKEN_2022_PROGRAM_ID
      );
      
      // If transfer hook is enabled, initialize the transfer hook
      if (hasTransferHook && transferHookProgramPubkey) {
        setPoolCreationStatus('Initializing transfer hook...');
        
        // Create the initialize transfer hook instruction
        const initializeTransferHookInstruction = createInitializeTransferHookInstruction(
          mint,
          mintAuthority,
          transferHookProgramPubkey,
          TOKEN_2022_PROGRAM_ID
        );
        
        // Send the transaction to initialize the transfer hook
        const transaction = new web3.Transaction().add(initializeTransferHookInstruction);
        const signature = await wallet.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature, 'confirmed');
      }
      
      setPoolCreationStatus(`Token-2022 created successfully! Mint address: ${mint.toBase58()}`);
    } catch (error: any) {
      console.error("Error creating Token-2022:", error);
      setPoolCreationStatus(`Error: ${error.message}`);
    }
  };

  // Create Raydium pool with automation
  const createRaydiumPoolAutomated = async () => {
    if (!program || !publicKey || !connection || !wallet.signTransaction) return;

    try {
      setPoolCreationStatus('Creating Raydium pool with automation...');
      
      // Validate input parameters
      if (!tokenAMint || !tokenBMint || !tokenAAmount || !tokenBAmount) {
        throw new Error("Please provide all token parameters");
      }
      
      // Parse input values
      const ammProgram = new PublicKey(ammProgramId);
      const serumProgram = new PublicKey(serumProgramId);
      const nonce = parseInt(ammAuthorityNonce);
      
      // Validate token mint addresses
      const tokenAMintPubkey = new PublicKey(tokenAMint);
      const tokenBMintPubkey = new PublicKey(tokenBMint);
      
      // Derive the middleware PDA
      const [middlewarePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("middleware")],
        MIDDLEWARE_PROGRAM_ID
      );
      
      // Generate placeholder accounts (in a real implementation, these would be properly derived)
      const accounts = {
        authority: publicKey,
        raydiumPoolProgram: ammProgram,
        ammPool: web3.Keypair.generate().publicKey,
        ammAuthority: web3.Keypair.generate().publicKey,
        ammOpenOrders: web3.Keypair.generate().publicKey,
        ammTargetOrders: web3.Keypair.generate().publicKey,
        ammLpMint: web3.Keypair.generate().publicKey,
        ammCoinMint: tokenAMintPubkey,
        ammPcMint: tokenBMintPubkey,
        ammCoinVault: web3.Keypair.generate().publicKey,
        ammPcVault: web3.Keypair.generate().publicKey,
        ammFeeDestination: web3.Keypair.generate().publicKey,
        serumMarket: web3.Keypair.generate().publicKey,
        serumCoinVault: web3.Keypair.generate().publicKey,
        serumPcVault: web3.Keypair.generate().publicKey,
        serumVaultSigner: web3.Keypair.generate().publicKey,
        serumEventQueue: web3.Keypair.generate().publicKey,
        serumBids: web3.Keypair.generate().publicKey,
        serumAsks: web3.Keypair.generate().publicKey,
        serumCoinMint: tokenAMintPubkey,
        serumPcMint: tokenBMintPubkey,
        serumCoinLotSize: web3.Keypair.generate().publicKey,
        serumPcLotSize: web3.Keypair.generate().publicKey,
        userCoinTokenAccount: web3.Keypair.generate().publicKey,
        userPcTokenAccount: web3.Keypair.generate().publicKey,
        userLpTokenAccount: web3.Keypair.generate().publicKey,
        serumProgram: serumProgram,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        rent: web3.SYSVAR_RENT_PUBKEY,
        middlewarePda: middlewarePda,
      };
      
      // Call the program method
      const tx = await program.methods
        .createRaydiumPool(
          ammProgram,
          serumProgram,
          new BN(nonce)
        )
        .accounts(accounts)
        .transaction();
      
      const signature = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      setPoolCreationStatus('Raydium pool created successfully with automated account derivation!');
    } catch (error: any) {
      console.error("Error creating Raydium pool:", error);
      if (error.logs) {
        console.error("Transaction logs:", error.logs);
      }
      setPoolCreationStatus(`Error: ${error.message}`);
    }
  };

  // Execute swap with hook validation
  const executeSwap = async () => {
    if (!program || !publicKey || !wallet.signTransaction) return;

    try {
      setPoolCreationStatus('Executing swap with hook validation...');
      
      // Parse input values
      const amountInValue = parseInt(amountIn);
      const minAmountOutValue = parseInt(minAmountOut);
      const decimalsValue = parseInt(decimals);
      
      // Derive the middleware PDA
      const [middlewarePda] = PublicKey.findProgramAddressSync(
        [Buffer.from("middleware")],
        MIDDLEWARE_PROGRAM_ID
      );
      
      // In a real implementation, you would need to provide all the required accounts
      const placeholderAccounts = {
        sourceAccount: web3.Keypair.generate().publicKey,
        mintAccount: web3.Keypair.generate().publicKey,
        destinationAccount: web3.Keypair.generate().publicKey,
        authority: publicKey,
        hookProgram: web3.Keypair.generate().publicKey,
        raydiumSwapProgram: new PublicKey("DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav"),
        ammAuthority: web3.Keypair.generate().publicKey,
        ammOpenOrders: web3.Keypair.generate().publicKey,
        ammTargetOrders: web3.Keypair.generate().publicKey,
        poolSourceTokenAccount: web3.Keypair.generate().publicKey,
        poolDestinationTokenAccount: web3.Keypair.generate().publicKey,
        userSourceTokenAccount: web3.Keypair.generate().publicKey,
        userDestinationTokenAccount: web3.Keypair.generate().publicKey,
        serumMarket: web3.Keypair.generate().publicKey,
        serumEventQueue: web3.Keypair.generate().publicKey,
        serumBids: web3.Keypair.generate().publicKey,
        serumAsks: web3.Keypair.generate().publicKey,
        serumCoinVault: web3.Keypair.generate().publicKey,
        serumPcVault: web3.Keypair.generate().publicKey,
        serumVaultSigner: web3.Keypair.generate().publicKey,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        rent: web3.SYSVAR_RENT_PUBKEY,
        middlewarePda: middlewarePda,
      };
      
      const tx = await program.methods
        .executeSwapWithHookCheck(
          new BN(amountInValue),
          new BN(minAmountOutValue),
          decimalsValue
        )
        .accounts(placeholderAccounts)
        .transaction();
      
      const signature = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      setPoolCreationStatus('Swap executed successfully!');
    } catch (error: any) {
      console.error("Error executing swap:", error);
      if (error.logs) {
        console.error("Transaction logs:", error.logs);
      }
      setPoolCreationStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-400">Middleware Program Interface</h1>
            <div className="flex items-center gap-4">
              <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300" />
              {publicKey && (
                <div className="bg-gray-700 px-3 py-2 rounded-lg">
                  <p className="text-sm text-gray-300">Connected Wallet:</p>
                  <p className="font-mono text-xs truncate max-w-xs">{publicKey.toString()}</p>
                </div>
              )}
              {/* Token Prices */}
              <div className="bg-gray-700 px-3 py-2 rounded-lg">
                <p className="text-sm text-gray-300">Token Prices:</p>
                <div className="flex gap-2">
                  <span className="text-xs">SOL: ${tokenPrices.solana?.usd || '0.00'}</span>
                  <span className="text-xs">BTC: ${tokenPrices.bitcoin?.usd || '0.00'}</span>
                  <span className="text-xs">ETH: ${tokenPrices.ethereum?.usd || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!publicKey ? (
          <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Wallet Connection Required</h2>
            <p className="text-gray-300 mb-6">Please connect your wallet to interact with the middleware program.</p>
            <WalletMultiButton className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Middleware Initialization</h2>
              <button 
                onClick={initializeMiddleware} 
                disabled={!program}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Initialize Middleware
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Whitelisted Hook Management</h2>
              <div className="mb-4">
                <label htmlFor="hookProgramId" className="block text-gray-300 mb-2">Hook Program ID:</label>
                <input
                  id="hookProgramId"
                  type="text"
                  value={hookProgramId}
                  onChange={(e) => setHookProgramId(e.target.value)}
                  placeholder="Enter hook program ID"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button 
                onClick={addWhitelistedHook} 
                disabled={!program || !middlewareAccount}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Add Whitelisted Hook
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Token-2022 Creation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="tokenName" className="block text-gray-300 mb-2">Token Name:</label>
                  <input
                    id="tokenName"
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Enter token name"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tokenSymbol" className="block text-gray-300 mb-2">Token Symbol:</label>
                  <input
                    id="tokenSymbol"
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="Enter token symbol"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tokenSupply" className="block text-gray-300 mb-2">Token Supply:</label>
                  <input
                    id="tokenSupply"
                    type="text"
                    value={tokenSupply}
                    onChange={(e) => setTokenSupply(e.target.value)}
                    placeholder="Enter token supply"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tokenDecimals" className="block text-gray-300 mb-2">Decimals:</label>
                  <input
                    id="tokenDecimals"
                    type="text"
                    value={tokenDecimals}
                    onChange={(e) => setTokenDecimals(e.target.value)}
                    placeholder="Enter decimals"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    checked={hasTransferHook}
                    onChange={(e) => setHasTransferHook(e.target.checked)}
                    className="mr-2"
                  />
                  Add Transfer Hook
                </label>
              </div>
              
              {hasTransferHook && (
                <div className="mb-4">
                  <label htmlFor="transferHookProgramId" className="block text-gray-300 mb-2">Transfer Hook Program ID:</label>
                  <input
                    id="transferHookProgramId"
                    type="text"
                    value={transferHookProgramId}
                    onChange={(e) => setTransferHookProgramId(e.target.value)}
                    placeholder="Enter transfer hook program ID"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <button
                onClick={createToken2022}
                disabled={!program || !tokenName || !tokenSymbol || !tokenSupply}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Create Token-2022
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Raydium Pool Creation (Automated)</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="tokenAMint" className="block text-gray-300 mb-2">Token A Mint Address:</label>
                  <input
                    id="tokenAMint"
                    type="text"
                    value={tokenAMint}
                    onChange={(e) => setTokenAMint(e.target.value)}
                    placeholder="Enter Token A mint address"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tokenBMint" className="block text-gray-300 mb-2">Token B Mint Address:</label>
                  <input
                    id="tokenBMint"
                    type="text"
                    value={tokenBMint}
                    onChange={(e) => setTokenBMint(e.target.value)}
                    placeholder="Enter Token B mint address"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tokenAAmount" className="block text-gray-300 mb-2">Token A Amount:</label>
                  <input
                    id="tokenAAmount"
                    type="text"
                    value={tokenAAmount}
                    onChange={(e) => setTokenAAmount(e.target.value)}
                    placeholder="Enter Token A amount"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="tokenBAmount" className="block text-gray-300 mb-2">Token B Amount:</label>
                  <input
                    id="tokenBAmount"
                    type="text"
                    value={tokenBAmount}
                    onChange={(e) => setTokenBAmount(e.target.value)}
                    placeholder="Enter Token B amount"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="ammProgramId" className="block text-gray-300 mb-2">AMM Program ID:</label>
                  <input
                    id="ammProgramId"
                    type="text"
                    value={ammProgramId}
                    onChange={(e) => setAmmProgramId(e.target.value)}
                    placeholder="Enter AMM program ID"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="serumProgramId" className="block text-gray-300 mb-2">Serum Program ID:</label>
                  <input
                    id="serumProgramId"
                    type="text"
                    value={serumProgramId}
                    onChange={(e) => setSerumProgramId(e.target.value)}
                    placeholder="Enter Serum program ID"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="ammAuthorityNonce" className="block text-gray-300 mb-2">AMM Authority Nonce:</label>
                  <input
                    id="ammAuthorityNonce"
                    type="text"
                    value={ammAuthorityNonce}
                    onChange={(e) => setAmmAuthorityNonce(e.target.value)}
                    placeholder="Enter AMM authority nonce"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button 
                onClick={createRaydiumPoolAutomated} 
                disabled={!program || !tokenAMint || !tokenBMint || !tokenAAmount || !tokenBAmount}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Create Raydium Pool (Automated)
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Execute Swap with Hook Validation</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="amountIn" className="block text-gray-300 mb-2">Amount In:</label>
                  <input
                    id="amountIn"
                    type="text"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    placeholder="Enter amount in"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="minAmountOut" className="block text-gray-300 mb-2">Minimum Amount Out:</label>
                  <input
                    id="minAmountOut"
                    type="text"
                    value={minAmountOut}
                    onChange={(e) => setMinAmountOut(e.target.value)}
                    placeholder="Enter minimum amount out"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="decimals" className="block text-gray-300 mb-2">Decimals:</label>
                  <input
                    id="decimals"
                    type="text"
                    value={decimals}
                    onChange={(e) => setDecimals(e.target.value)}
                    placeholder="Enter decimals"
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <button
                onClick={executeSwap}
                disabled={!program}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Execute Swap
              </button>
            </div>

            {poolCreationStatus && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-blue-400">Status</h2>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-200">{poolCreationStatus}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
