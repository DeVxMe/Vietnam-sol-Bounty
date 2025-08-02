import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMiddlewareProgram } from '@/hooks/useMiddlewareProgram';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Plus, ArrowRightLeft, Zap, Coins, Waves, TrendingUp, Bug } from 'lucide-react';
import TransactionStatus from './TransactionStatus';
import HookSelector from './HookSelector';
import TokenSelector from './TokenSelector';
import StatusCard from './StatusCard';
import { PublicKey } from '@solana/web3.js';

const MiddlewareForm = () => {
  const {
    connection,
    wallet,
    initializeMiddleware,
    addWhitelistedHook,
    executeSwapWithHookCheck,
    executeSimpleSwap,
    createToken2022WithHook,
    createLPPool,
    enableTrading,
    getMiddlewarePDA,
    debugAccount,
  } = useMiddlewareProgram();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentTx, setCurrentTx] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<{
    status: 'success' | 'error' | 'pending' | 'idle';
    message?: string;
    title?: string;
  }>({ status: 'idle' });
  
  // Form states
  const [hookProgram, setHookProgram] = useState('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'); // SPL Token program
  
  // Token creation state
  const [tokenDecimals, setTokenDecimals] = useState(9);
  const [tokenHookProgram, setTokenHookProgram] = useState('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'); // SPL Token program
  
  // LP Pool state
  const [lpParams, setLpParams] = useState({
    coinMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    pcMint: 'So11111111111111111111111111111111111111112', // SOL
    coinAmount: 1000000, // 1 USDC
    pcAmount: 1000000000, // 1 SOL (in lamports)
  });
  
  // Trading state
  const [poolAddress, setPoolAddress] = useState('');
  const [debugAccountAddress, setDebugAccountAddress] = useState('');
  const [swapMode, setSwapMode] = useState<'simple' | 'advanced'>('simple');
  const [swapParams, setSwapParams] = useState({
    amountIn: '1000000',
    minAmountOut: '950000',
    decimals: '6',
    sourceAccount: 'So11111111111111111111111111111111111111112', // SOL mint
    mintAccount: 'So11111111111111111111111111111111111111112', // SOL mint
    destinationAccount: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC mint
    hookProgram: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // SPL Token program
    userSourceTokenAccount: '',
    userDestinationTokenAccount: '',
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
  });

  // Input validation helpers
  const validateNumberInput = (value: string): boolean => {
    return /^\d*\.?\d*$/.test(value) && !isNaN(Number(value)) && Number(value) >= 0;
  };

  const validatePublicKeyInput = (value: string): boolean => {
    return /^[A-Za-z0-9]{32,44}$/.test(value);
  };

  const formatNumberInput = (value: string): string => {
    // Remove non-numeric characters except decimal point
    return value.replace(/[^\d.]/g, '');
  };

  const formatPublicKeyInput = (value: string): string => {
    // Remove spaces and convert to uppercase
    return value.replace(/\s/g, '').toUpperCase();
  };

  const handleInitialize = async () => {
    setLoading(true);
    setOperationStatus({ status: 'pending', title: 'Initializing Middleware', message: 'Processing transaction...' });
    
    try {
      // Pre-validation
      if (!wallet?.publicKey) {
        throw new Error("Please connect your wallet first");
      }

      const signature = await initializeMiddleware();
      setCurrentTx(signature);
      setOperationStatus({ 
        status: 'success', 
        title: 'Middleware Initialized', 
        message: 'Middleware program initialized successfully' 
      });
      toast({
        title: "Success!",
        description: "Middleware initialized successfully",
      });
    } catch (error) {
      console.error('Initialize error:', error);
      setOperationStatus({ 
        status: 'error', 
        title: 'Initialization Failed', 
        message: error instanceof Error ? error.message : 'Failed to initialize middleware'
      });
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to initialize middleware",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddHook = async () => {
    if (!hookProgram) {
      toast({
        title: "Error",
        description: "Please enter a hook program address",
        variant: "destructive",
      });
      return;
    }

    // Validate public key format
    try {
      new PublicKey(hookProgram);
    } catch {
      toast({
        title: "Error",
        description: "Invalid hook program address format",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signature = await addWhitelistedHook(hookProgram);
      setCurrentTx(signature);
      toast({
        title: "Success!",
        description: "Hook program whitelisted successfully",
      });
      setHookProgram('');
    } catch (error) {
      console.error('Add hook error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to whitelist hook program",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = async () => {
    // Only require essential fields for swap
    if (!swapParams.amountIn || !swapParams.minAmountOut) {
      toast({
        title: "Error",
        description: "Please enter amount in and minimum amount out",
        variant: "destructive",
      });
      return;
    }

    // Validate numbers
    const amountIn = Number(swapParams.amountIn);
    const minAmountOut = Number(swapParams.minAmountOut);
    
    if (isNaN(amountIn) || amountIn <= 0) {
      toast({
        title: "Error",
        description: "Amount in must be a positive number",
        variant: "destructive",
      });
      return;
    }

    if (isNaN(minAmountOut) || minAmountOut <= 0) {
      toast({
        title: "Error",
        description: "Minimum amount out must be a positive number",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      let signature: string;
      
      if (swapMode === 'simple') {
        // Use simplified swap with default accounts
        signature = await executeSimpleSwap(amountIn, minAmountOut);
      } else {
        // Use advanced swap with custom accounts
        signature = await executeSwapWithHookCheck({
          ...swapParams,
          amountIn: amountIn,
          minAmountOut: minAmountOut,
          decimals: parseInt(swapParams.decimals) || 6,
        });
      }
      
      setCurrentTx(signature);
      toast({
        title: "Success!",
        description: "Swap executed successfully",
      });
    } catch (error) {
      console.error('Swap error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to execute swap",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateToken = async () => {
    // Validate decimals
    if (tokenDecimals < 0 || tokenDecimals > 18 || !Number.isInteger(tokenDecimals)) {
      toast({
        title: "Error",
        description: "Decimals must be between 0 and 18",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signature = await createToken2022WithHook(tokenDecimals, tokenHookProgram);
      setCurrentTx(signature);
      toast({
        title: "Success!",
        description: "Token created successfully",
      });
    } catch (error) {
      console.error('Create token error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create token",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLPPool = async () => {
    // Validate amounts
    if (lpParams.coinAmount <= 0 || lpParams.pcAmount <= 0) {
      toast({
        title: "Error",
        description: "Both amounts must be positive numbers",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signature = await createLPPool(lpParams);
      setCurrentTx(signature);
      toast({
        title: "Success!",
        description: "Liquidity pool created successfully",
      });
    } catch (error) {
      console.error('Create LP pool error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create liquidity pool",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableTrading = async () => {
    if (!poolAddress) {
      toast({
        title: "Error",
        description: "Please enter a pool address",
        variant: "destructive",
      });
      return;
    }

    // Validate public key format
    try {
      new PublicKey(poolAddress);
    } catch {
      toast({
        title: "Error",
        description: "Invalid pool address format",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const signature = await enableTrading(poolAddress);
      setCurrentTx(signature);
      toast({
        title: "Success!",
        description: "Trading enabled successfully",
      });
    } catch (error) {
      console.error('Enable trading error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enable trading",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDebugAccount = async () => {
    if (!debugAccountAddress) {
      toast({
        title: "Error",
        description: "Please enter an account address to debug",
        variant: "destructive",
      });
      return;
    }

    // Validate public key format
    try {
      new PublicKey(debugAccountAddress);
    } catch {
      toast({
        title: "Error",
        description: "Invalid account address format",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await debugAccount(debugAccountAddress);
      toast({
        title: "Debug Complete",
        description: "Check the browser console for account details",
      });
    } catch (error) {
      console.error('Debug account error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to debug account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-border/50 card-glow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Zap className="h-5 w-5 text-primary" />
            Raydium Middleware Controller
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="initialize" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="initialize" className="gap-2">
                <Settings className="h-4 w-4" />
                Initialize
              </TabsTrigger>
              <TabsTrigger value="whitelist" className="gap-2">
                <Plus className="h-4 w-4" />
                Whitelist
              </TabsTrigger>
              <TabsTrigger value="swap" className="gap-2">
                <ArrowRightLeft className="h-4 w-4" />
                Swap
              </TabsTrigger>
              <TabsTrigger value="token" className="gap-2">
                <Coins className="h-4 w-4" />
                Token
              </TabsTrigger>
              <TabsTrigger value="pool" className="gap-2">
                <Waves className="h-4 w-4" />
                Pool
              </TabsTrigger>
              <TabsTrigger value="trading" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Trading
              </TabsTrigger>
              <TabsTrigger value="debug" className="gap-2">
                <Bug className="h-4 w-4" />
                Debug
              </TabsTrigger>
            </TabsList>

            <TabsContent value="initialize" className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Initialize the middleware program to start using transfer hook validation with Raydium swaps.
                </p>
                <Button
                  onClick={handleInitialize}
                  disabled={loading}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Initialize Middleware
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="whitelist" className="space-y-4">
              <div className="space-y-4">
                <HookSelector
                  value={hookProgram}
                  onChange={setHookProgram}
                  label="Hook Program Address"
                  placeholder="Enter transfer hook program public key..."
                />
                <Button
                  onClick={handleAddHook}
                  disabled={loading || !hookProgram}
                  variant="accent"
                  size="lg"
                  className="w-full"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add to Whitelist
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="swap" className="space-y-6">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Execute a swap with transfer hook validation. Simple mode uses default accounts for easier testing.
                </p>
                
                {/* Swap Mode Toggle */}
                <div className="space-y-2">
                  <Label>Swap Mode</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={swapMode === 'simple' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSwapMode('simple')}
                    >
                      Simple (Default Accounts)
                    </Button>
                    <Button
                      variant={swapMode === 'advanced' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSwapMode('advanced')}
                    >
                      Advanced (Custom Accounts)
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {swapMode === 'simple' 
                      ? 'Uses default SOL/USDC pool accounts for easier testing' 
                      : 'Allows custom account configuration for advanced users'
                    }
                  </p>
                </div>
                
                {/* Essential Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountIn">Amount In (lamports)</Label>
                    <Input
                      id="amountIn"
                      value={swapParams.amountIn}
                      onChange={(e) => setSwapParams(prev => ({ ...prev, amountIn: formatNumberInput(e.target.value) }))}
                      placeholder="1000000"
                      type="number"
                    />
                    <p className="text-xs text-muted-foreground">Amount to swap (e.g., 1000000 = 0.001 SOL)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minAmountOut">Min Amount Out (lamports)</Label>
                    <Input
                      id="minAmountOut"
                      value={swapParams.minAmountOut}
                      onChange={(e) => setSwapParams(prev => ({ ...prev, minAmountOut: formatNumberInput(e.target.value) }))}
                      placeholder="950000"
                      type="number"
                    />
                    <p className="text-xs text-muted-foreground">Minimum amount to receive</p>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                  <Label>Quick Presets</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSwapParams(prev => ({ ...prev, amountIn: '1000000', minAmountOut: '950000' }))}
                    >
                      0.001 SOL → 0.95 USDC
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSwapParams(prev => ({ ...prev, amountIn: '10000000', minAmountOut: '9500000' }))}
                    >
                      0.01 SOL → 9.5 USDC
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSwapParams(prev => ({ ...prev, amountIn: '100000000', minAmountOut: '95000000' }))}
                    >
                      0.1 SOL → 95 USDC
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleSwap}
                disabled={loading}
                variant="success"
                size="lg"
                className="w-full"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Execute {swapMode === 'simple' ? 'Simple' : 'Advanced'} Swap
              </Button>
            </TabsContent>

            <TabsContent value="token" className="space-y-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Create a new Token-2022 with transfer hook capabilities. Uses default SPL Token program.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tokenDecimals">Token Decimals</Label>
                                          <Input
                        id="tokenDecimals"
                        type="number"
                        value={tokenDecimals}
                        onChange={(e) => {
                          const value = Number(formatNumberInput(e.target.value));
                          if (value >= 0 && value <= 18 && Number.isInteger(value)) {
                            setTokenDecimals(value);
                          }
                        }}
                        placeholder="9"
                        min="0"
                        max="18"
                      />
                    <p className="text-xs text-muted-foreground">Number of decimal places (e.g., 9 for SOL, 6 for USDC)</p>
                  </div>
                  
                  {/* Quick Presets */}
                  <div className="space-y-2">
                    <Label>Quick Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTokenDecimals(6)}
                      >
                        USDC Style (6 decimals)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTokenDecimals(9)}
                      >
                        SOL Style (9 decimals)
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTokenDecimals(18)}
                      >
                        ETH Style (18 decimals)
                      </Button>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateToken} 
                  disabled={loading}
                  variant="accent"
                  size="lg"
                  className="w-full"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Token-2022 with Hook
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pool" className="space-y-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Create a new liquidity pool on Raydium. Defaults to USDC-SOL pair.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coinAmount">Initial USDC Amount</Label>
                      <Input
                        id="coinAmount"
                        type="number"
                        value={lpParams.coinAmount}
                        onChange={(e) => setLpParams(prev => ({ ...prev, coinAmount: Number(formatNumberInput(e.target.value)) || 0 }))}
                        placeholder="1000000"
                      />
                      <p className="text-xs text-muted-foreground">Amount in smallest units (e.g., 1000000 = 1 USDC)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pcAmount">Initial SOL Amount (lamports)</Label>
                      <Input
                        id="pcAmount"
                        type="number"
                        value={lpParams.pcAmount}
                        onChange={(e) => setLpParams(prev => ({ ...prev, pcAmount: Number(formatNumberInput(e.target.value)) || 0 }))}
                        placeholder="1000000000"
                      />
                      <p className="text-xs text-muted-foreground">Amount in lamports (e.g., 1000000000 = 1 SOL)</p>
                    </div>
                  </div>
                  
                  {/* Quick Presets */}
                  <div className="space-y-2">
                    <Label>Quick Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLpParams(prev => ({ ...prev, coinAmount: 1000000, pcAmount: 1000000000 }))}
                      >
                        1 USDC + 1 SOL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLpParams(prev => ({ ...prev, coinAmount: 10000000, pcAmount: 10000000000 }))}
                      >
                        10 USDC + 10 SOL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLpParams(prev => ({ ...prev, coinAmount: 100000000, pcAmount: 100000000000 }))}
                      >
                        100 USDC + 100 SOL
                      </Button>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleCreateLPPool} 
                  disabled={loading}
                  variant="success"
                  size="lg"
                  className="w-full"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create USDC-SOL Liquidity Pool
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="trading" className="space-y-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Enable trading on an existing liquidity pool to allow users to start swapping tokens.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="poolAddress">Pool Address</Label>
                  <Input
                    id="poolAddress"
                    value={poolAddress}
                    onChange={(e) => setPoolAddress(formatPublicKeyInput(e.target.value))}
                    placeholder="Liquidity pool public key..."
                  />
                </div>
                <Button 
                  onClick={handleEnableTrading} 
                  disabled={loading || !poolAddress}
                  variant="hero"
                  size="lg"
                  className="w-full"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Enable Trading
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="debug" className="space-y-4">
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Debug tools to help identify transaction issues and account information.
                </p>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="debugAccount">Account Address to Debug</Label>
                    <Input
                      id="debugAccount"
                      value={debugAccountAddress}
                      onChange={(e) => setDebugAccountAddress(formatPublicKeyInput(e.target.value))}
                      placeholder="Enter account public key to debug..."
                    />
                  </div>
                  <Button 
                    onClick={handleDebugAccount} 
                    disabled={loading || !debugAccountAddress}
                    variant="outline"
                    size="lg"
                    className="w-full"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Debug Account
                  </Button>
                  <div className="space-y-2">
                    <Label>Middleware PDA</Label>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm">
                      {getMiddlewarePDA()[0].toBase58()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Problematic Account (from error)</Label>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm">
                      5o9anye9pXRy4SD5KQpoaii1gT41FHd7opJs9unXQYfb
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <StatusCard
        title={operationStatus.title || 'Operation Status'}
        status={operationStatus.status}
        message={operationStatus.message}
        signature={currentTx || undefined}
      />
      
      {currentTx && (
        <div className="flex justify-center">
          <TransactionStatus
            signature={currentTx}
            onClose={() => setCurrentTx(null)}
          />
        </div>
      )}
    </div>
  );
};

export default MiddlewareForm;