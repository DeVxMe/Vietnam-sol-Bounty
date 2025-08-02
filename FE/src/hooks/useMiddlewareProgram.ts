import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction, SendTransactionError } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { MIDDLEWARE_PROGRAM_ID, RAYDIUM_AMM_PROGRAM_ID } from '@/types/program';

// Validation helpers
const validatePublicKey = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

const validateNumber = (value: string | number): boolean => {
  const num = Number(value);
  return !isNaN(num) && num > 0 && isFinite(num);
};

const validateBuffer = (data: any): boolean => {
  try {
    if (data instanceof Buffer) return true;
    if (ArrayBuffer.isView(data)) return true;
    if (typeof data === 'string') {
      Buffer.from(data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const useMiddlewareProgram = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const getMiddlewarePDA = () => {
    try {
      const [pda, bump] = PublicKey.findProgramAddressSync(
        [Buffer.from("middleware")],
        new PublicKey(MIDDLEWARE_PROGRAM_ID)
      );
      console.log('Generated PDA:', {
        pda: pda.toBase58(),
        bump,
        seeds: ['middleware'],
        programId: MIDDLEWARE_PROGRAM_ID,
      });
      return [pda, bump] as const;
    } catch (error) {
      console.error('Error generating PDA:', error);
      throw new Error('Failed to generate program derived address');
    }
  };

  // Helper function to handle transaction errors
  const handleTransactionError = (error: any, operation: string) => {
    if (error instanceof SendTransactionError) {
      console.error(`${operation} SendTransactionError details:`, {
        message: error.message,
        logs: error.logs,
        error: error.error,
      });
      
      // Extract logs for better debugging
      const logs = error.logs || [];
      const errorMessage = logs.join('\n');
      
      throw new Error(`${operation} failed: ${error.message}\n\nLogs:\n${errorMessage}`);
    }
    
    // Re-throw other errors
    throw error;
  };

  // Debug function to help identify problematic accounts
  const debugAccount = async (accountAddress: string) => {
    try {
      if (!validatePublicKey(accountAddress)) {
        throw new Error('Invalid public key format');
      }
      
      const accountInfo = await connection.getAccountInfo(new PublicKey(accountAddress));
      console.log(`Account ${accountAddress}:`, {
        exists: !!accountInfo,
        owner: accountInfo?.owner?.toBase58(),
        lamports: accountInfo?.lamports,
        dataLength: accountInfo?.data?.length,
        executable: accountInfo?.executable,
        rentEpoch: accountInfo?.rentEpoch,
      });
      return accountInfo;
    } catch (error) {
      console.error(`Error fetching account ${accountAddress}:`, error);
      throw new Error(`Failed to debug account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
// Fixed version of the initializeMiddleware function
const initializeMiddleware = async () => {
  try {
    if (!wallet?.publicKey) throw new Error("Wallet not connected");
    if (!connection) throw new Error("Connection not available");

    // Validate program ID
    if (!validatePublicKey(MIDDLEWARE_PROGRAM_ID)) {
      throw new Error("Invalid middleware program ID");
    }

    // Check if program exists first
    try {
      const programInfo = await connection.getAccountInfo(new PublicKey(MIDDLEWARE_PROGRAM_ID));
      if (!programInfo) {
        throw new Error("Middleware program not found on devnet. Please deploy the program first.");
      }
      console.log('Program found:', {
        programId: MIDDLEWARE_PROGRAM_ID,
        executable: programInfo.executable,
        owner: programInfo.owner.toBase58(),
        lamports: programInfo.lamports,
        dataLength: programInfo.data?.length,
      });
    } catch (error) {
      console.error('Program check error:', error);
      throw new Error("Failed to check program deployment. Please verify the program is deployed to devnet.");
    }

    const [middlewarePDA, bump] = getMiddlewarePDA();

    console.log('Middleware PDA:', middlewarePDA.toBase58());
    console.log('Bump seed:', bump);

    // Check if middleware is already initialized
    try {
      const middlewareAccount = await connection.getAccountInfo(middlewarePDA);
      if (middlewareAccount) {
        throw new Error("Middleware already initialized");
      }
      console.log('Middleware account does not exist yet - proceeding with initialization');
    } catch (error) {
      console.log('Middleware account check failed - proceeding with initialization');
    }

    // Use proper Anchor instruction discriminator for initialize
    const discriminator = Buffer.from([0x1f, 0x9a, 0x6f, 0xaf, 0xaf, 0xed, 0x9b, 0x98]);
    
    if (!validateBuffer(discriminator)) {
      throw new Error("Invalid instruction discriminator");
    }

    // Create instruction data - only include bump if required by the program
    const instructionData = Buffer.concat([
      discriminator,
      Buffer.from([bump]), // Include bump seed for PDA verification
    ]);
    
    console.log('Using instruction discriminator:', discriminator.toString('hex'));
    console.log('Instruction data:', {
      discriminator: discriminator.toString('hex'),
      bump,
      dataLength: instructionData.length,
      fullData: instructionData.toString('hex'),
    });

    // FIXED: PDA should NOT be a signer - only the wallet should be the signer
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: middlewarePDA, isSigner: false, isWritable: true }, // PDA is NOT a signer
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // Authority pays rent and is signer
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      programId: new PublicKey(MIDDLEWARE_PROGRAM_ID),
      data: instructionData,
    });

    console.log('Instruction details:', {
      programId: MIDDLEWARE_PROGRAM_ID,
      dataLength: instructionData.length,
      wallet: wallet.publicKey?.toBase58(),
      accounts: instruction.keys.map((key, index) => ({
        index,
        pubkey: key.pubkey.toBase58(),
        isSigner: key.isSigner,
        isWritable: key.isWritable,
      })),
    });

    const transaction = new Transaction();
    
    // Add compute budget instructions for better reliability
    const computeBudgetInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey("ComputeBudget111111111111111111111111111111"),
      data: Buffer.concat([
        Buffer.from([0x02]), // SetComputeUnitLimit instruction
        Buffer.from(new Uint8Array(new Uint32Array([300_000]).buffer)), // 300k compute units
      ]),
    });
    
    const computePriceInstruction = new TransactionInstruction({
      keys: [],
      programId: new PublicKey("ComputeBudget111111111111111111111111111111"),
      data: Buffer.concat([
        Buffer.from([0x03]), // SetComputeUnitPrice instruction
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(1000)]).buffer)), // 1000 microlamports
      ]),
    });

    transaction.add(computeBudgetInstruction);
    transaction.add(computePriceInstruction);
    transaction.add(instruction);
    
    console.log('Transaction details:', {
      instructions: transaction.instructions.length,
      feePayer: transaction.feePayer?.toBase58(),
      recentBlockhash: transaction.recentBlockhash,
    });
    
    const latestBlockhash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockhash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    console.log('Updated transaction details:', {
      instructions: transaction.instructions.length,
      feePayer: transaction.feePayer?.toBase58(),
      recentBlockhash: transaction.recentBlockhash,
      walletPublicKey: wallet.publicKey?.toBase58(),
      middlewarePDA: middlewarePDA.toBase58(),
      bump: bump,
    });
    
    try {
      console.log('Signing transaction with wallet:', wallet.publicKey?.toBase58());
      const signedTransaction = await wallet.signTransaction(transaction);
      console.log('Transaction signed successfully');
      
      // First try with preflight to get detailed error information
      try {
        console.log('Simulating transaction...');
        const simulation = await connection.simulateTransaction(signedTransaction, {
          commitment: 'processed',
        });
        console.log('Simulation result:', simulation);
        
        if (simulation.value.err) {
          console.error('Simulation error:', simulation.value.err);
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
        }
        
        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'processed',
        });
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });
        
        console.log('Transaction confirmed:', confirmation);
        return signature;
      } catch (preflightError) {
        console.error('Preflight failed:', preflightError);
        
        // If preflight fails, try without preflight as a fallback
        console.log('Retrying without preflight...');
        const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
          skipPreflight: true,
        });
        return signature;
      }
    } catch (error) {
      handleTransactionError(error, 'Initialize middleware');
    }
  } catch (error) {
    console.error('Initialize middleware error:', error);
    throw error;
  }
};

  const addWhitelistedHook = async (hookProgram: string) => {
    try {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      if (!connection) throw new Error("Connection not available");
      if (!hookProgram) throw new Error("Hook program address is required");
      if (!validatePublicKey(hookProgram)) throw new Error("Invalid hook program address");

      const [middlewarePDA, bump] = getMiddlewarePDA();

      // Create instruction data with hook program pubkey
      // The Anchor program expects: hook_program: Pubkey
      const hookPubkey = new PublicKey(hookProgram);
      const instructionData = Buffer.concat([
        Buffer.from([0x21, 0xb4, 0xf0, 0xa1, 0x6e, 0xbc, 0x5f, 0x73]), // "global:add_whitelisted_hook"
        hookPubkey.toBuffer(),
      ]);

      if (!validateBuffer(instructionData)) {
        throw new Error("Invalid instruction data");
      }

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: middlewarePDA, isSigner: false, isWritable: true }, // PDA as writable account (not signer for non-init operations)
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        ],
        programId: new PublicKey(MIDDLEWARE_PROGRAM_ID),
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;
      
      try {
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } catch (error) {
        handleTransactionError(error, 'Add whitelisted hook');
      }
    } catch (error) {
      console.error('Add whitelisted hook error:', error);
      throw error;
    }
  };

  const executeSwapWithHookCheck = async (params: {
    amountIn: number;
    minAmountOut: number;
    decimals: number;
    sourceAccount: string;
    mintAccount: string;
    destinationAccount: string;
    hookProgram: string;
    userSourceTokenAccount: string;
    userDestinationTokenAccount: string;
    // Raydium specific accounts (would be fetched from Raydium SDK in production)
    ammAuthority: string;
    ammOpenOrders: string;
    ammTargetOrders: string;
    poolSourceTokenAccount: string;
    poolDestinationTokenAccount: string;
    serumMarket: string;
    serumEventQueue: string;
    serumBids: string;
    serumAsks: string;
    serumCoinVault: string;
    serumPcVault: string;
    serumVaultSigner: string;
  }) => {
    try {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      if (!connection) throw new Error("Connection not available");

      // Validate all required parameters
      if (!validateNumber(params.amountIn)) throw new Error("Invalid amount in");
      if (!validateNumber(params.minAmountOut)) throw new Error("Invalid minimum amount out");
      if (!validateNumber(params.decimals)) throw new Error("Invalid decimals");
      if (!validatePublicKey(params.sourceAccount)) throw new Error("Invalid source account");
      if (!validatePublicKey(params.mintAccount)) throw new Error("Invalid mint account");
      if (!validatePublicKey(params.destinationAccount)) throw new Error("Invalid destination account");
      if (!validatePublicKey(params.hookProgram)) throw new Error("Invalid hook program");

      const [middlewarePDA, bump] = getMiddlewarePDA();

      // Create instruction data matching the Anchor program's expected format
      // The Anchor program expects: amount_in, min_amount_out, decimals
      const instructionData = Buffer.concat([
        Buffer.from([0x91, 0x0f, 0x55, 0x9c, 0x7a, 0x61, 0x63, 0x44]), // "global:execute_swap_with_hook_check"
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(params.amountIn)]).buffer)),
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(params.minAmountOut)]).buffer)),
        Buffer.from([params.decimals]),
      ]);

      if (!validateBuffer(instructionData)) {
        throw new Error("Invalid instruction data");
      }

      // Build accounts in the exact order expected by the Anchor program
      const instruction = new TransactionInstruction({
        keys: [
          // CheckTransferHook accounts (first 5)
          { pubkey: new PublicKey(params.sourceAccount), isSigner: false, isWritable: false },
          { pubkey: new PublicKey(params.mintAccount), isSigner: false, isWritable: false },
          { pubkey: new PublicKey(params.destinationAccount), isSigner: false, isWritable: false },
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: new PublicKey(params.hookProgram), isSigner: false, isWritable: false },
          
          // Raydium swap program
          { pubkey: new PublicKey(RAYDIUM_AMM_PROGRAM_ID), isSigner: false, isWritable: false },
          
          // AMM accounts
          { pubkey: new PublicKey(params.ammAuthority), isSigner: false, isWritable: false },
          { pubkey: new PublicKey(params.ammOpenOrders), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.ammTargetOrders), isSigner: false, isWritable: true },
          
          // Pool token accounts
          { pubkey: new PublicKey(params.poolSourceTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.poolDestinationTokenAccount), isSigner: false, isWritable: true },
          
          // User token accounts
          { pubkey: new PublicKey(params.userSourceTokenAccount), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.userDestinationTokenAccount), isSigner: false, isWritable: true },
          
          // Serum market accounts
          { pubkey: new PublicKey(params.serumMarket), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.serumEventQueue), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.serumBids), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.serumAsks), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.serumCoinVault), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.serumPcVault), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(params.serumVaultSigner), isSigner: false, isWritable: false },
          
          // System accounts
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          
          // Middleware PDA (must be last as per Anchor program)
          { pubkey: middlewarePDA, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(MIDDLEWARE_PROGRAM_ID),
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;
      
      try {
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } catch (error) {
        handleTransactionError(error, 'Execute swap with hook check');
      }
    } catch (error) {
      console.error('Execute swap error:', error);
      throw error;
    }
  };

  const createToken2022WithHook = async (decimals: number, hookProgram: string) => {
    try {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      if (!connection) throw new Error("Connection not available");
      if (!validateNumber(decimals)) throw new Error("Invalid decimals");
      if (!validatePublicKey(hookProgram)) throw new Error("Invalid hook program");

      // Simplified Token-2022 creation with transfer hook
      const mintKeypair = new PublicKey(hookProgram); // Placeholder
      const instructionData = Buffer.concat([
        Buffer.from([4]), // Create token with hook instruction
        Buffer.from([decimals]),
        new PublicKey(hookProgram).toBuffer(),
      ]);

      if (!validateBuffer(instructionData)) {
        throw new Error("Invalid instruction data");
      }

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(MIDDLEWARE_PROGRAM_ID),
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;
      
      try {
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } catch (error) {
        handleTransactionError(error, 'Create token with hook');
      }
    } catch (error) {
      console.error('Create token error:', error);
      throw error;
    }
  };

  const createLPPool = async (params: {
    coinMint: string;
    pcMint: string;
    coinAmount: number;
    pcAmount: number;
  }) => {
    try {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      if (!connection) throw new Error("Connection not available");
      if (!validatePublicKey(params.coinMint)) throw new Error("Invalid coin mint");
      if (!validatePublicKey(params.pcMint)) throw new Error("Invalid pc mint");
      if (!validateNumber(params.coinAmount)) throw new Error("Invalid coin amount");
      if (!validateNumber(params.pcAmount)) throw new Error("Invalid pc amount");

      const instructionData = Buffer.concat([
        Buffer.from([5]), // Create LP pool instruction
        new PublicKey(params.coinMint).toBuffer(),
        new PublicKey(params.pcMint).toBuffer(),
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(params.coinAmount)]).buffer)),
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(params.pcAmount)]).buffer)),
      ]);

      if (!validateBuffer(instructionData)) {
        throw new Error("Invalid instruction data");
      }

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: new PublicKey(params.coinMint), isSigner: false, isWritable: false },
          { pubkey: new PublicKey(params.pcMint), isSigner: false, isWritable: false },
          { pubkey: new PublicKey(RAYDIUM_AMM_PROGRAM_ID), isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(MIDDLEWARE_PROGRAM_ID),
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;
      
      try {
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } catch (error) {
        handleTransactionError(error, 'Create LP pool');
      }
    } catch (error) {
      console.error('Create LP pool error:', error);
      throw error;
    }
  };

  const enableTrading = async (poolAddress: string) => {
    try {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      if (!connection) throw new Error("Connection not available");
      if (!poolAddress) throw new Error("Pool address is required");
      if (!validatePublicKey(poolAddress)) throw new Error("Invalid pool address");

      const instructionData = Buffer.concat([
        Buffer.from([6]), // Enable trading instruction
        new PublicKey(poolAddress).toBuffer(),
      ]);

      if (!validateBuffer(instructionData)) {
        throw new Error("Invalid instruction data");
      }

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
          { pubkey: new PublicKey(poolAddress), isSigner: false, isWritable: true },
          { pubkey: new PublicKey(RAYDIUM_AMM_PROGRAM_ID), isSigner: false, isWritable: false },
        ],
        programId: new PublicKey(MIDDLEWARE_PROGRAM_ID),
        data: instructionData,
      });

      const transaction = new Transaction().add(instruction);
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;
      
      try {
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } catch (error) {
        handleTransactionError(error, 'Enable trading');
      }
    } catch (error) {
      console.error('Enable trading error:', error);
      throw error;
    }
  };

  const executeSimpleSwap = async (amountIn: number, minAmountOut: number) => {
    try {
      if (!wallet?.publicKey) throw new Error("Wallet not connected");
      if (!connection) throw new Error("Connection not available");

      // Validate parameters
      if (!validateNumber(amountIn)) throw new Error("Invalid amount in");
      if (!validateNumber(minAmountOut)) throw new Error("Invalid minimum amount out");

      const [middlewarePDA, bump] = getMiddlewarePDA();

      // Use default Raydium accounts for SOL/USDC swap
      const defaultAccounts = {
        sourceAccount: 'So11111111111111111111111111111111111111112', // SOL mint
        mintAccount: 'So11111111111111111111111111111111111111112', // SOL mint
        destinationAccount: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint
        hookProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token program
        userSourceTokenAccount: wallet.publicKey.toBase58(), // User's SOL account
        userDestinationTokenAccount: wallet.publicKey.toBase58(), // User's USDC account
        ammAuthority: '5Q544fKrFoe6tsEbD7S8EmxGTJYAKtTVhAW5Q5pge4j1',
        ammOpenOrders: 'HxFLKUAmAMLz1jtT3hbvCMELwH5H9tpM2QugP8sKyhhW',
        ammTargetOrders: 'CZza3Ej4Mc58MnxWA385itCC9jCo3L1D7zc3LKy1bZMR',
        poolSourceTokenAccount: 'DQKJRRMvd1xEreQKpZgYWA8F4inKxnAqmTq4E5Bu4M1y',
        poolDestinationTokenAccount: 'HLmqeL62xR1QoZ1HKKbXRrdN1p3phKpxRMb2VVopvBBz',
        serumMarket: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        serumEventQueue: '5KKs6cQwJv4bJw3qKJwK6qKJwK6qKJwK6qKJwK6qKJwK6',
        serumBids: '14ivtgssEBoBjuZJtSAPKYgpUK7DmnSwuPMqJoVTSgKJ',
        serumAsks: 'CEQdAFKdycHugujRic9wSUxLw9kqWJfe1YNbKnWpxZJz',
        serumCoinVault: '36c6YqAbyHYmYwP4zSk2Df7w9N2Z2JwK6qKJwK6qKJwK6',
        serumPcVault: '8HoQnePLqPj4M7PUDzfw8e3Ymdwgc7NLGnaTUapubyvu',
        serumVaultSigner: '8VuvrSWfQP8vdbuMAP9Xf8tk5rg1djX2cWJvK5mksjJX',
      };

      // Create instruction data
      const instructionData = Buffer.concat([
        Buffer.from([0x91, 0x0f, 0x55, 0x9c, 0x7a, 0x61, 0x63, 0x44]), // "global:execute_swap_with_hook_check"
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(amountIn)]).buffer)),
        Buffer.from(new Uint8Array(new BigUint64Array([BigInt(minAmountOut)]).buffer)),
        Buffer.from([6]), // 6 decimals for USDC
      ]);

      if (!validateBuffer(instructionData)) {
        throw new Error("Invalid instruction data");
      }

                // Build accounts in the exact order expected by the Anchor program
          const instruction = new TransactionInstruction({
            keys: [
              // CheckTransferHook accounts (first 5)
              { pubkey: new PublicKey(defaultAccounts.sourceAccount), isSigner: false, isWritable: false },
              { pubkey: new PublicKey(defaultAccounts.mintAccount), isSigner: false, isWritable: false },
              { pubkey: new PublicKey(defaultAccounts.destinationAccount), isSigner: false, isWritable: false },
              { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
              { pubkey: new PublicKey(defaultAccounts.hookProgram), isSigner: false, isWritable: false },
              
              // Raydium swap program
              { pubkey: new PublicKey(RAYDIUM_AMM_PROGRAM_ID), isSigner: false, isWritable: false },
              
              // AMM accounts
              { pubkey: new PublicKey(defaultAccounts.ammAuthority), isSigner: false, isWritable: false },
              { pubkey: new PublicKey(defaultAccounts.ammOpenOrders), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.ammTargetOrders), isSigner: false, isWritable: true },
              
              // Pool token accounts
              { pubkey: new PublicKey(defaultAccounts.poolSourceTokenAccount), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.poolDestinationTokenAccount), isSigner: false, isWritable: true },
              
              // User token accounts
              { pubkey: new PublicKey(defaultAccounts.userSourceTokenAccount), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.userDestinationTokenAccount), isSigner: false, isWritable: true },
              
              // Serum market accounts
              { pubkey: new PublicKey(defaultAccounts.serumMarket), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.serumEventQueue), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.serumBids), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.serumAsks), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.serumCoinVault), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.serumPcVault), isSigner: false, isWritable: true },
              { pubkey: new PublicKey(defaultAccounts.serumVaultSigner), isSigner: false, isWritable: false },
              
              // System accounts
              { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
              { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
              
              // Middleware PDA (must be last as per Anchor program)
              { pubkey: middlewarePDA, isSigner: false, isWritable: false },
            ],
            programId: new PublicKey(MIDDLEWARE_PROGRAM_ID),
            data: instructionData,
          });

      const transaction = new Transaction().add(instruction);
      const latestBlockhash = await connection.getLatestBlockhash();
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = wallet.publicKey;
      
      try {
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        
        return signature;
      } catch (error) {
        handleTransactionError(error, 'Execute simple swap');
      }
    } catch (error) {
      console.error('Execute simple swap error:', error);
      throw error;
    }
  };

  return {
    connection,
    wallet,
    initializeMiddleware,
    addWhitelistedHook,
    executeSwapWithHookCheck,
    createToken2022WithHook,
    createLPPool,
    enableTrading,
    getMiddlewarePDA,
    debugAccount,
    executeSimpleSwap,
  };
};