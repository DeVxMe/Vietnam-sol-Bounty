import { Buffer } from 'buffer';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Comprehensive polyfill for Node.js modules in browser
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = { env: {} };
  (window as any).Buffer = Buffer;
  
  // Polyfill for crypto module
  if (!(window as any).crypto) {
    (window as any).crypto = (window as any).crypto || {};
  }
  
  // Polyfill for stream module
  if (!(window as any).stream) {
    (window as any).stream = {};
  }
}

// Make Buffer available globally for Solana packages
globalThis.Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);