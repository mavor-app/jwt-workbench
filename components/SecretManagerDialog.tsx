import * as React from 'react';
import { IconCheck, IconInfoCircle, IconKey, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { IconButton } from '@/components/IconButton';
import { useSecrets } from '@/hooks/useSecrets';
import type { SavedSecret } from '@/lib/storage';

interface SecretManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SecretRow({ secret }: { secret: SavedSecret }) {
  const { updateSecret, deleteSecret } = useSecrets();
  const [editing, setEditing] = React.useState(false);
  const [name, setName] = React.useState(secret.name);
  const [value, setValue] = React.useState(secret.value);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const startEdit = () => {
    setName(secret.name);
    setValue(secret.value);
    setEditing(true);
  };

  const save = async () => {
    if (!name.trim() || !value) return;
    await updateSecret(secret.id, { name: name.trim(), value });
    setEditing(false);
    toast.success('Secret updated');
  };

  if (editing) {
    return (
      <div className="flex flex-col gap-2.5 rounded-md border p-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${secret.id}-name`} className="text-muted-foreground text-xs">
            Name
          </Label>
          <Input
            id={`${secret.id}-name`}
            className="h-8"
            value={name}
            placeholder="Name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${secret.id}-value`} className="text-muted-foreground text-xs">
            Value
          </Label>
          <Input
            id={`${secret.id}-value`}
            className="h-8 font-mono text-xs"
            value={value}
            placeholder="Value"
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-1">
          <IconButton label="Cancel" onClick={() => setEditing(false)}>
            <IconX />
          </IconButton>
          <IconButton label="Save changes" onClick={() => void save()} disabled={!name.trim() || !value}>
            <IconCheck className="text-success" />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-md border p-2">
      <IconKey className="text-muted-foreground size-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{secret.name}</div>
        <div className="text-muted-foreground truncate font-mono text-xs">
          {'•'.repeat(Math.min(secret.value.length, 24))}
        </div>
      </div>
      <IconButton label="Edit secret" onClick={startEdit}>
        <IconPencil />
      </IconButton>
      <IconButton label="Delete secret" onClick={() => setConfirmOpen(true)}>
        <IconTrash className="text-destructive" />
      </IconButton>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${secret.name}"?`}
        description="Projects using this secret will lose it."
        onConfirm={async () => {
          await deleteSecret(secret.id);
          toast.success('Secret deleted');
        }}
      />
    </div>
  );
}

export function SecretManagerDialog({ open, onOpenChange }: SecretManagerDialogProps) {
  const { secrets } = useSecrets();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Secrets</DialogTitle>
          <DialogDescription>Named secrets you can reuse across projects.</DialogDescription>
        </DialogHeader>
        <div className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
          {secrets.length === 0 ? (
            <Alert>
              <IconInfoCircle />
              <AlertTitle>No secrets yet</AlertTitle>
              <AlertDescription>Type a secret and use the save button to add one.</AlertDescription>
            </Alert>
          ) : (
            secrets.map((secret) => <SecretRow key={secret.id} secret={secret} />)
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
