import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'

// Polyfill for Buffer in browser environment
import { Buffer } from 'buffer'

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css'

// Add Buffer to global scope
globalThis.Buffer = Buffer

const network = 'devnet' // Change to 'mainnet-beta' for production
const endpoint = clusterApiUrl(network)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </StrictMode>,
)
