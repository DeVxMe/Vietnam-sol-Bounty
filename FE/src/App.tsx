import React, { useState, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import idl from '../../target/idl/middleware.json';
import './App.css';

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

  // Initialize the program
  useEffect(() => {
    if (!connection || !publicKey) return;

    const provider = new AnchorProvider(connection, wallet as any, {
      commitment: 'confirmed',
    });

    const programInstance = new Program(idl as any, provider);
    setProgram(programInstance);
  }, [connection, publicKey]);

  // Find middleware account
  useEffect(() => {
    if (!program || !publicKey) return;

    const findMiddlewareAccount = async () => {
      try {
        // This is a simplified version - in practice, you'd need to find or create the middleware account
        // based on your program's logic
        console.log("Middleware account would be initialized here");
      } catch (error) {
        console.error("Error finding middleware account:", error);
      }
    };

    findMiddlewareAccount();
  }, [program, publicKey]);

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
    if (!program || !publicKey) return;

    try {
      setPoolCreationStatus('Initializing middleware...');
      
      // Generate a new keypair for the middleware account
      const middlewareKeypair = web3.Keypair.generate();
      setMiddlewareAccount(middlewareKeypair.publicKey);
      
      const tx = await program.methods.initialize()
        .accounts({
          middleware: middlewareKeypair.publicKey,
          authority: publicKey,
          systemProgram: web3.SystemProgram.programId,
        } as any)
        .transaction();
      
      // Sign and send the transaction
      const signature = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      setPoolCreationStatus('Middleware initialized successfully!');
    } catch (error: any) {
      console.error("Error initializing middleware:", error);
      setPoolCreationStatus(`Error: ${error.message}`);
    }
  };

  // Add whitelisted hook
  const addWhitelistedHook = async () => {
    if (!program || !publicKey || !middlewareAccount) return;

    try {
      setPoolCreationStatus('Adding whitelisted hook...');
      
      const hookProgram = new PublicKey(hookProgramId);
      
      const tx = await program.methods.addWhitelistedHook(hookProgram)
        .accounts({
          middleware: middlewareAccount,
          authority: publicKey,
        } as any)
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

  // Create Raydium pool
  const createRaydiumPool = async () => {
    if (!program || !publicKey) return;

    try {
      setPoolCreationStatus('Creating Raydium pool...');
      
      // Parse input values
      const ammProgram = new PublicKey(ammProgramId);
      const serumProgram = new PublicKey(serumProgramId);
      const nonce = parseInt(ammAuthorityNonce);
      
      // In a real implementation, you would need to provide all the required accounts
      // For now, we'll just simulate the process with placeholder accounts
      const placeholderAccounts = {
        authority: publicKey,
        raydiumPoolProgram: ammProgram,
        ammPool: web3.Keypair.generate().publicKey,
        ammAuthority: web3.Keypair.generate().publicKey,
        ammOpenOrders: web3.Keypair.generate().publicKey,
        ammTargetOrders: web3.Keypair.generate().publicKey,
        ammLpMint: web3.Keypair.generate().publicKey,
        ammCoinMint: web3.Keypair.generate().publicKey,
        ammPcMint: web3.Keypair.generate().publicKey,
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
        serumCoinMint: web3.Keypair.generate().publicKey,
        serumPcMint: web3.Keypair.generate().publicKey,
        serumCoinLotSize: web3.Keypair.generate().publicKey,
        serumPcLotSize: web3.Keypair.generate().publicKey,
        userCoinTokenAccount: web3.Keypair.generate().publicKey,
        userPcTokenAccount: web3.Keypair.generate().publicKey,
        userLpTokenAccount: web3.Keypair.generate().publicKey,
        serumProgram: serumProgram,
        tokenProgram: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
        middlewarePda: web3.Keypair.generate().publicKey,
      };
      
      // This is where you would call the actual program method
      // For now, we'll just simulate the process
      setPoolCreationStatus('Raydium pool creation initiated!');
      
      // In a real implementation, you would do something like:
      const tx = await program.methods.createRaydiumPool(
        ammProgram,
        serumProgram,
        new BN(nonce)
      )
        .accounts(placeholderAccounts)
        .transaction();
      
      const signature = await wallet.sendTransaction(tx, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      setPoolCreationStatus('Raydium pool created successfully!');
    } catch (error: any) {
      console.error("Error creating Raydium pool:", error);
      setPoolCreationStatus(`Error: ${error.message}`);
    }
  };

  // Execute swap with hook validation
  const executeSwap = async () => {
    if (!program || !publicKey) return;

    try {
      setPoolCreationStatus('Executing swap with hook validation...');
      
      // Parse input values
      const amountInValue = parseInt(amountIn);
      const minAmountOutValue = parseInt(minAmountOut);
      const decimalsValue = parseInt(decimals);
      
      // In a real implementation, you would need to provide all the required accounts
      // For now, we'll just use placeholder accounts
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
        rent: new PublicKey("SysvarRent111111111111111111111111111111111"),
        middlewarePda: web3.Keypair.generate().publicKey,
      };
      
      const tx = await program.methods.executeSwapWithHookCheck(
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
              <h2 className="text-xl font-semibold mb-4 text-blue-400">Raydium Pool Creation</h2>
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
                onClick={createRaydiumPool} 
                disabled={!program}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Create Raydium Pool
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
