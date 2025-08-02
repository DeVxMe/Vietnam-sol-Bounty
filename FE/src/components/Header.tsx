import { Activity, Shield, Zap } from 'lucide-react';
import WalletButton from './WalletButton';

const Header = () => {
  return (
    <header className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-primary glow-effect" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">
                Hook Flow Guard
              </h1>
              <p className="text-sm text-muted-foreground">
                Raydium Transfer Hook Middleware
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Devnet</span>
            </div>
            <WalletButton />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;