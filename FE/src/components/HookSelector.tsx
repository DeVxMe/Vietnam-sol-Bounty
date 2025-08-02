import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';

interface HookSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder: string;
}

// Common middleware hooks for easy selection
const COMMON_HOOKS = [
  {
    name: 'Middleware Hook',
    address: 'HkSRt9K7DLmn8Zj8DgNAhPYoKCajgKhU3QhEqH3V4TfX',
    description: 'Standard middleware transfer hook'
  },
  {
    name: 'Security Hook', 
    address: 'SecHkQt9K7DLmn8Zj8DgNAhPYoKCajgKhU3QhEqH3V4TX',
    description: 'Enhanced security validation hook'
  },
  {
    name: 'Compliance Hook',
    address: 'CompHkQt9K7DLmn8Zj8DgNAhPYoKCajgKhU3QhEqH3VTX',
    description: 'Regulatory compliance hook'
  }
];

const HookSelector = ({ value, onChange, label, placeholder }: HookSelectorProps) => {
  const [customMode, setCustomMode] = useState(false);
  const [selectedHook, setSelectedHook] = useState('');

  const handleSelectHook = (hookAddress: string) => {
    setSelectedHook(hookAddress);
    onChange(hookAddress);
  };

  const handleCustomInput = (customValue: string) => {
    onChange(customValue);
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {!customMode ? (
        <div className="space-y-3">
          <Select value={selectedHook} onValueChange={handleSelectHook}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a common hook program..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border/50">
              {COMMON_HOOKS.map((hook) => (
                <SelectItem key={hook.address} value={hook.address} className="cursor-pointer">
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{hook.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {hook.address.slice(0, 8)}...
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{hook.description}</span>
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
            Use Custom Hook Address
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
                setSelectedHook('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a custom transfer hook program address
          </p>
        </div>
      )}
      
      {value && (
        <div className="p-3 bg-primary/10 border border-primary/20 rounded-md">
          <p className="text-sm text-primary font-medium">Selected Hook:</p>
          <p className="text-xs font-mono text-muted-foreground break-all">{value}</p>
        </div>
      )}
    </div>
  );
};

export default HookSelector;