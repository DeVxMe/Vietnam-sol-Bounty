import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut } from 'lucide-react';

const WalletButton = () => {
  const { connected, disconnect, publicKey } = useWallet();

  if (!connected) {
    return (
      <div className="wallet-adapter-button-trigger">
        <WalletMultiButton className="!bg-gradient-primary !text-primary-foreground hover:!shadow-glow !transition-all !duration-300 hover:!scale-105 !rounded-md !font-semibold" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-card rounded-md border border-border">
        <Wallet className="h-4 w-4 text-primary" />
        <span className="text-sm font-mono">
          {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={disconnect}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Disconnect
      </Button>
    </div>
  );
};

export default WalletButton;