import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TransactionStatusProps {
  signature: string | null;
  onClose: () => void;
}

const TransactionStatus = ({ signature, onClose }: TransactionStatusProps) => {
  const { connection } = useConnection();
  const { toast } = useToast();
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');

  useEffect(() => {
    if (!signature) return;

    const checkStatus = async () => {
      try {
        const result = await connection.getSignatureStatus(signature);
        if (result.value?.confirmationStatus === 'confirmed' || result.value?.confirmationStatus === 'finalized') {
          setStatus('confirmed');
        } else if (result.value?.err) {
          setStatus('failed');
        }
      } catch (error) {
        console.error('Error checking transaction status:', error);
        setStatus('failed');
      }
    };

    const interval = setInterval(checkStatus, 2000);
    checkStatus();

    return () => clearInterval(interval);
  }, [signature, connection]);

  const copySignature = () => {
    if (signature) {
      navigator.clipboard.writeText(signature);
      toast({
        title: "Copied!",
        description: "Transaction signature copied to clipboard",
      });
    }
  };

  const openExplorer = () => {
    if (signature) {
      window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank');
    }
  };

  if (!signature) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="h-6 w-6 text-warning animate-pulse" />;
      case 'confirmed':
        return <CheckCircle className="h-6 w-6 text-success" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-destructive" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'success';
      case 'failed':
        return 'destructive';
    }
  };

  return (
    <Card className="w-full max-w-md bg-gradient-card border-border/50 card-glow">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-2">
          {getStatusIcon()}
        </div>
        <CardTitle className="text-lg">Transaction {status}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <Badge variant={getStatusColor() as any} className="text-sm">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Signature:</p>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
            <code className="text-xs flex-1 break-all">
              {signature.slice(0, 20)}...{signature.slice(-20)}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={copySignature}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={openExplorer}
            className="flex-1 gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Explorer
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionStatus;