import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { MIDDLEWARE_PROGRAM_ID, RAYDIUM_AMM_PROGRAM_ID } from '@/types/program';

const ProgramChecker = () => {
  const { connection } = useConnection();
  const [programStatus, setProgramStatus] = useState({
    middleware: 'checking',
    raydium: 'checking',
  });

  useEffect(() => {
    const checkPrograms = async () => {
      try {
        // Check middleware program
        const middlewareInfo = await connection.getAccountInfo(new PublicKey(MIDDLEWARE_PROGRAM_ID));
        const middlewareStatus = middlewareInfo ? 'deployed' : 'not-found';

        // Check Raydium program
        const raydiumInfo = await connection.getAccountInfo(new PublicKey(RAYDIUM_AMM_PROGRAM_ID));
        const raydiumStatus = raydiumInfo ? 'deployed' : 'not-found';

        setProgramStatus({
          middleware: middlewareStatus,
          raydium: raydiumStatus,
        });
      } catch (error) {
        console.error('Error checking programs:', error);
        setProgramStatus({
          middleware: 'error',
          raydium: 'error',
        });
      }
    };

    checkPrograms();
  }, [connection]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'not-found':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return <Badge variant="default" className="bg-green-500">Deployed</Badge>;
      case 'not-found':
        return <Badge variant="destructive">Not Found</Badge>;
      case 'error':
        return <Badge variant="secondary">Error</Badge>;
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50 card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertCircle className="h-5 w-5 text-primary" />
          Program Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(programStatus.middleware)}
            <span className="text-sm font-medium">Middleware Program</span>
          </div>
          {getStatusBadge(programStatus.middleware)}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(programStatus.raydium)}
            <span className="text-sm font-medium">Raydium AMM</span>
          </div>
          {getStatusBadge(programStatus.raydium)}
        </div>

        {programStatus.middleware === 'not-found' && (
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
            <p className="text-sm text-yellow-400">
              ⚠️ Middleware program not deployed to devnet. Please deploy the program first before using the interface.
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div>Middleware: {MIDDLEWARE_PROGRAM_ID}</div>
          <div>Raydium: {RAYDIUM_AMM_PROGRAM_ID}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgramChecker;