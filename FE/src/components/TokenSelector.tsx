import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Coins } from 'lucide-react';

interface TokenSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

// Common Solana tokens for easy selection
const COMMON_TOKENS = [
  {
    name: 'SOL',
    symbol: 'SOL',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9
  },
  {
    name: 'USDC',
    symbol: 'USDC',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6
  },
  {
    name: 'USDT',
    symbol: 'USDT', 
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6
  },
  {
    name: 'RAY',
    symbol: 'RAY',
    address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6
  }
];

const TokenSelector = ({ value, onChange, label, placeholder }: TokenSelectorProps) => {
  const [customMode, setCustomMode] = useState(false);
  const [selectedToken, setSelectedToken] = useState('');

  const handleSelectToken = (tokenAddress: string) => {
    setSelectedToken(tokenAddress);
    onChange(tokenAddress);
  };

  const handleCustomInput = (customValue: string) => {
    onChange(customValue);
  };

  const selectedTokenInfo = COMMON_TOKENS.find(token => token.address === selectedToken);

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Coins className="h-4 w-4" />
        {label}
      </Label>
      
      {!customMode ? (
        <div className="space-y-3">
          <Select value={selectedToken} onValueChange={handleSelectToken}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a token..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50">
              {COMMON_TOKENS.map((token) => (
                <SelectItem key={token.address} value={token.address} className="cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{token.symbol[0]}</span>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{token.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {token.symbol}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {token.decimals} decimals • {token.address.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCustomMode(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Use Custom Token Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => handleCustomInput(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                setCustomMode(false);
                onChange('');
                setSelectedToken('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a custom token mint address
          </p>
        </div>
      )}
      
      {(selectedTokenInfo || (value && customMode)) && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
          {selectedTokenInfo ? (
            <div>
              <p className="text-sm text-primary font-medium">Selected: {selectedTokenInfo.name} ({selectedTokenInfo.symbol})</p>
              <p className="text-xs text-muted-foreground">Decimals: {selectedTokenInfo.decimals}</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{selectedTokenInfo.address}</p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-primary font-medium">Custom Token:</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{value}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TokenSelector;