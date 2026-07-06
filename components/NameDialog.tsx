import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Label shown above the input field. */
  fieldLabel?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  onSubmit: (name: string) => void | Promise<void>;
  /** Extra read-only labeled fields shown above the name input, for context. */
  children?: React.ReactNode;
}

/** Small prompt dialog asking for a single name (Save As, Rename, name a secret, …). */
export function NameDialog({
  open,
  onOpenChange,
  title,
  description,
  fieldLabel = 'Name',
  placeholder = 'Name',
  defaultValue = '',
  confirmLabel = 'Save',
  onSubmit,
  children,
}: NameDialogProps) {
  const [name, setName] = React.useState(defaultValue);
  const id = React.useId();

  React.useEffect(() => {
    if (open) setName(defaultValue);
  }, [open, defaultValue]);

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSubmit(trimmed);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {children}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{fieldLabel}</Label>
            <Input
              id={id}
              autoFocus
              value={name}
              placeholder={placeholder}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void submit();
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => void submit()} disabled={!name.trim()}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Read-only labeled field for use inside NameDialog. */
export function DialogField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <Input readOnly tabIndex={-1} value={value} className={mono ? 'font-mono text-xs' : undefined} />
    </div>
  );
}
