import './styles/globals.css';
import type { Metadata } from 'next';
import { WalletProvider } from './components/WalletProvider';
import { ConnectWalletButton } from './components/ConnectWalletButton';

export const metadata: Metadata = {
  title: 'Token-2022 Transfer Hooks AMM',
  description: 'Trade Token-2022 tokens with Transfer Hooks safely on Solana AMMs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark-900 text-dark-100 min-h-screen">
        <WalletProvider>
          <nav className="bg-dark-800 border-b border-dark-700">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-primary-400">Token-2022 AMM</h1>
                </div>
                <div className="flex space-x-4">
                  <a href="/" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-700">
                    Home
                  </a>
                  <a href="/create-token" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-700">
                    Create Token
                  </a>
                  <a href="/create-pool" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-700">
                    Create Pool
                  </a>
                  <a href="/swap" className="px-3 py-2 rounded-md text-sm font-medium hover:bg-dark-700">
                    Swap
                  </a>
                  <ConnectWalletButton />
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}