import * as React from 'react';
import { IconDownload, IconUpload } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useProjects } from '@/hooks/useProjects';
import { useSecrets } from '@/hooks/useSecrets';
import { store } from '@/lib/storage';
import {
  applyImport,
  exportStore,
  findConflicts,
  parseImport,
  TransferError,
  type ConflictMode,
  type ImportData,
  type ImportSummary,
} from '@/lib/transfer';

function summaryMessage(summary: ImportSummary): string {
  const parts: string[] = [];
  if (summary.addedProjects > 0) {
    parts.push(`${summary.addedProjects} project${summary.addedProjects === 1 ? '' : 's'}`);
  }
  if (summary.addedSecrets > 0) {
    parts.push(`${summary.addedSecrets} secret${summary.addedSecrets === 1 ? '' : 's'}`);
  }
  const extras: string[] = [];
  if (summary.overwritten > 0) extras.push(`${summary.overwritten} overwritten`);
  if (summary.skipped > 0) extras.push(`${summary.skipped} skipped`);
  const suffix = extras.length > 0 ? ` (${extras.join(', ')})` : '';

  if (parts.length === 0 && summary.overwritten === 0) {
    return 'Nothing imported — all entries were skipped';
  }
  if (parts.length === 0) {
    return `Import finished${suffix}`;
  }
  return `Imported ${parts.join(' and ')}${suffix}`;
}

function conflictMessage(conflicts: { projects: number; secrets: number }): string {
  const parts: string[] = [];
  if (conflicts.projects > 0) {
    parts.push(`${conflicts.projects} project${conflicts.projects === 1 ? '' : 's'}`);
  }
  if (conflicts.secrets > 0) {
    parts.push(`${conflicts.secrets} secret${conflicts.secrets === 1 ? '' : 's'}`);
  }
  return `${parts.join(' and ')} in this file already exist with the same name. Overwrite the existing ones, or skip the duplicates?`;
}

/** Footer bar with import/export of all stored projects and secrets. */
export function TransferBar() {
  const { projects } = useProjects();
  const { secrets } = useSecrets();
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState<ImportData | null>(null);
  const [conflicts, setConflicts] = React.useState({ projects: 0, secrets: 0 });

  const handleExport = async () => {
    const json = await exportStore();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jwt-workbench-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Projects & secrets exported');
  };

  const runImport = async (data: ImportData, mode: ConflictMode) => {
    const summary = await applyImport(data, mode);
    toast.success(summaryMessage(summary));
  };

  const handleFile = async (file: File) => {
    try {
      const data = parseImport(await file.text());
      const [projects, secrets] = await Promise.all([
        store.projects.getValue(),
        store.secrets.getValue(),
      ]);
      const found = findConflicts(data, { projects, secrets });
      if (found.projects + found.secrets > 0) {
        setConflicts(found);
        setPending(data);
      } else {
        await runImport(data, 'skip');
      }
    } catch (e) {
      toast.error(e instanceof TransferError ? e.message : 'Failed to import file');
    }
  };

  const resolveConflicts = async (mode: ConflictMode) => {
    const data = pending;
    setPending(null);
    if (data) await runImport(data, mode);
  };

  return (
    <div className="bg-background sticky bottom-0 z-10 flex items-center justify-between gap-1 border-t px-2 py-1">
      <span className="text-muted-foreground truncate pl-1.5 text-xs">
        {projects.length} project{projects.length === 1 ? '' : 's'} · {secrets.length} secret
        {secrets.length === 1 ? '' : 's'}
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ''; // allow re-picking the same file
            if (file) void handleFile(file);
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-7 text-xs"
          onClick={() => fileRef.current?.click()}
        >
          <IconUpload />
          Import
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-7 text-xs"
          onClick={() => void handleExport()}
        >
          <IconDownload />
          Export
        </Button>
      </div>

      <Dialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate names found</DialogTitle>
            <DialogDescription>{conflictMessage(conflicts)}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={() => void resolveConflicts('skip')}>
              Skip duplicates
            </Button>
            <Button onClick={() => void resolveConflicts('overwrite')}>Overwrite</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
