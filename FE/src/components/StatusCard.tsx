import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface StatusCardProps {
  title: string;
  status: 'success' | 'error' | 'pending' | 'idle';
  message?: string;
  signature?: string;
}

const StatusCard = ({ title, status, message, signature }: StatusCardProps) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  if (status === 'idle') return null;

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {title}
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {message && (
          <p className="text-sm text-muted-foreground mb-3">{message}</p>
        )}
        {signature && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-primary">Transaction Signature:</p>
            <p className="text-xs font-mono bg-muted p-2 rounded border break-all">
              {signature}
            </p>
            <a
              href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline"
            >
              View on Solana Explorer →
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusCard;