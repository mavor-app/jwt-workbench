import * as React from 'react';
import { IconClockPlus, IconClockX } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const PRESETS: Array<{ label: string; seconds: number }> = [
  { label: '5 minutes', seconds: 5 * 60 },
  { label: '10 minutes', seconds: 10 * 60 },
  { label: '30 minutes', seconds: 30 * 60 },
  { label: '1 hour', seconds: 60 * 60 },
  { label: '6 hours', seconds: 6 * 60 * 60 },
  { label: '1 day', seconds: 24 * 60 * 60 },
  { label: '7 days', seconds: 7 * 24 * 60 * 60 },
  { label: '1 month', seconds: 30 * 24 * 60 * 60 },
  { label: '3 months', seconds: 90 * 24 * 60 * 60 },
  { label: '1 year', seconds: 365 * 24 * 60 * 60 },
];

interface ExpMenuProps {
  payload: string;
  onChange: (payload: string) => void;
}

/** Quick-set the `exp` claim in the payload to now + a preset duration. */
export function ExpMenu({ payload, onChange }: ExpMenuProps) {
  const [open, setOpen] = React.useState(false);

  let parsed: Record<string, unknown> | null = null;
  try {
    const value: unknown = JSON.parse(payload);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      parsed = value as Record<string, unknown>;
    }
  } catch {
    // invalid JSON — menu stays disabled
  }
  const hasExp = parsed !== null && 'exp' in parsed;

  const apply = (mutate: (p: Record<string, unknown>) => void) => {
    if (!parsed) return;
    const next = { ...parsed };
    mutate(next);
    onChange(JSON.stringify(next, null, 2));
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label="Set expiration (exp)" disabled={!parsed}>
              <IconClockPlus />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Set expiration (exp)</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-44 p-0" align="end">
        <Command>
          <CommandList className="max-h-64">
            <CommandGroup heading="Expires in">
              {PRESETS.map(({ label, seconds }) => (
                <CommandItem
                  key={label}
                  value={label}
                  onSelect={() =>
                    apply((p) => {
                      const exp = Math.floor(Date.now() / 1000) + seconds;
                      p.exp = exp;
                      toast.success(`exp set to ${new Date(exp * 1000).toLocaleString()}`);
                    })
                  }
                >
                  <IconClockPlus />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
            {hasExp && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    value="remove-exp"
                    onSelect={() =>
                      apply((p) => {
                        delete p.exp;
                        toast.success('exp removed');
                      })
                    }
                  >
                    <IconClockX />
                    Remove exp
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
