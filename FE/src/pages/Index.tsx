import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/Header';
import StatusCard from '@/components/StatusCard';
import MiddlewareForm from '@/components/MiddlewareForm';
import ProgramChecker from '@/components/ProgramChecker';
import WalletButton from '@/components/WalletButton';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Shield, Zap, ArrowRight } from 'lucide-react';

const Index = () => {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!connected ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-8 py-16">
              <div className="space-y-4">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full blur-3xl opacity-20 scale-150" />
                  <Shield className="h-24 w-24 text-primary glow-effect relative z-10" />
                </div>
                <h1 className="text-4xl md:text-6xl font-bold gradient-text">
                  Hook Flow Guard
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Advanced transfer hook validation middleware for Raydium AMM swaps on Solana devnet. 
                  Secure, fast, and production-ready.
                </p>
              </div>

              <div className="flex justify-center">
                <WalletButton />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                <Card className="bg-gradient-card border-border/50 card-glow">
                  <CardContent className="pt-6 text-center space-y-3">
                    <Shield className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">Secure Validation</h3>
                    <p className="text-sm text-muted-foreground">
                      Advanced transfer hook validation before executing swaps
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50 card-glow">
                  <CardContent className="pt-6 text-center space-y-3">
                    <Zap className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">Raydium Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Direct integration with Raydium AMM for seamless swaps
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-card border-border/50 card-glow">
                  <CardContent className="pt-6 text-center space-y-3">
                    <ArrowRight className="h-8 w-8 text-primary mx-auto" />
                    <h3 className="font-semibold">Production Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Built for devnet with production-grade reliability
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                Middleware Control Panel
              </h1>
              <p className="text-muted-foreground">
                Manage transfer hook validation and execute secure Raydium swaps
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <ProgramChecker />
              </div>
              <div className="lg:col-span-2">
                <MiddlewareForm />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;