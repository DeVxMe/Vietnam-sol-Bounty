export const MIDDLEWARE_PROGRAM_ID = "H93bAJi5MMPbfSARnVimEzRccdZHkATNWBj2pdRBoMXJ";
export const RAYDIUM_AMM_PROGRAM_ID = "DRaya7Kj3aMWQSy19kSjvmuwq9docCHofyP9kanQGaav";

export interface MiddlewareAccount {
  authority: string;
  whitelistedHooks: number;
}

export interface SwapParams {
  amountIn: number;
  minAmountOut: number;
  sourceToken: string;
  destinationToken: string;
}

export interface PoolCreationParams {
  coinMint: string;
  pcMint: string;
  ammProgramId: string;
  serumProgramId: string;
  ammAuthorityNonce: number;
}

export interface TransferHookParams {
  sourceAccount: string;
  mintAccount: string;
  destinationAccount: string;
  amount: number;
  decimals: number;
}