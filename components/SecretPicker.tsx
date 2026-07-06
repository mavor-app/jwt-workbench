import * as React from 'react';
import {
  IconChevronDown,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconKey,
  IconKeyboard,
  IconSettings,
} from '@tabler/icons-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { IconButton } from '@/components/IconButton';
import { DialogField, NameDialog } from '@/components/NameDialog';
import { SecretManagerDialog } from '@/components/SecretManagerDialog';
import { useSecrets } from '@/hooks/useSecrets';
import { resolveSecret, type SecretRef } from '@/lib/storage';

interface SecretPickerProps {
  value: SecretRef;
  onChange: (ref: SecretRef) => void;
  placeholder?: string;
}

/**
 * Pick a saved secret from the library or type a raw value.
 * Raw values can be saved into the library with a name.
 */
export function SecretPicker({ value, onChange, placeholder = 'Secret' }: SecretPickerProps) {
  const { secrets, createSecret } = useSecrets();
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [managerOpen, setManagerOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const selectedSecret = value.type === 'saved' ? secrets.find((s) => s.id === value.id) : undefined;
  const resolved = resolveSecret(value, secrets);

  return (
    <div className="flex items-center gap-1">
      <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
        {value.type === 'raw' ? (
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              type={revealed ? 'text' : 'password'}
              className="h-8 pr-8 font-mono text-xs"
              placeholder={placeholder}
              value={value.value}
              onChange={(e) => onChange({ type: 'raw', value: e.target.value })}
            />
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Pick a saved secret"
                className="absolute top-0 right-0 h-8 w-8 text-muted-foreground"
              >
                <IconChevronDown />
              </Button>
            </PopoverTrigger>
          </div>
        ) : (
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-8 flex-1 justify-between px-2.5 font-normal"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <IconKey className="text-muted-foreground shrink-0" />
                {selectedSecret ? (
                  <span className="truncate">
                    {selectedSecret.name}
                    {revealed && (
                      <span className="text-muted-foreground ml-1.5 font-mono text-xs">
                        {selectedSecret.value}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-destructive truncate">Missing secret</span>
                )}
              </span>
              <IconChevronDown className="text-muted-foreground shrink-0" />
            </Button>
          </PopoverTrigger>
        )}
        <PopoverContent className="w-(--radix-popover-trigger-width) min-w-56 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search secrets…" />
            <CommandList>
              <CommandEmpty>No saved secrets.</CommandEmpty>
              {secrets.length > 0 && (
                <CommandGroup heading="Saved secrets">
                  {secrets.map((secret) => (
                    <CommandItem
                      key={secret.id}
                      value={secret.name}
                      onSelect={() => {
                        onChange({ type: 'saved', id: secret.id });
                        setPickerOpen(false);
                      }}
                    >
                      <IconKey />
                      <span className="truncate">{secret.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  value="__raw__"
                  onSelect={() => {
                    onChange({ type: 'raw', value: value.type === 'saved' ? resolved : value.value });
                    setPickerOpen(false);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                >
                  <IconKeyboard />
                  Enter secret manually
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <IconButton label={revealed ? 'Hide secret' : 'Show secret'} onClick={() => setRevealed(!revealed)}>
        {revealed ? <IconEyeOff /> : <IconEye />}
      </IconButton>
      {value.type === 'raw' && value.value.length > 0 && (
        <IconButton label="Save secret to library" onClick={() => setSaveOpen(true)}>
          <IconDeviceFloppy />
        </IconButton>
      )}
      <IconButton label="Manage secrets" onClick={() => setManagerOpen(true)}>
        <IconSettings />
      </IconButton>

      <NameDialog
        open={saveOpen}
        onOpenChange={setSaveOpen}
        title="Save secret"
        description="Give this secret a name so you can reuse it."
        fieldLabel="Secret name"
        placeholder="e.g. staging-api"
        onSubmit={async (name) => {
          const secret = await createSecret(name, value.type === 'raw' ? value.value : resolved);
          onChange({ type: 'saved', id: secret.id });
          toast.success(`Secret "${name}" saved`);
        }}
      >
        <DialogField
          label="Value"
          mono
          value={revealed ? resolved : '•'.repeat(Math.min(resolved.length, 24))}
        />
      </NameDialog>
      <SecretManagerDialog open={managerOpen} onOpenChange={setManagerOpen} />
    </div>
  );
}
