import * as React from 'react';
import {
  IconCopyPlus,
  IconDeviceFloppy,
  IconDotsVertical,
  IconPencil,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { IconButton } from '@/components/IconButton';
import { NameDialog } from '@/components/NameDialog';
import type { JwtProject } from '@/lib/storage';

interface ProjectBarProps {
  projects: JwtProject[];
  currentProject: JwtProject | null;
  dirty: boolean;
  onSelect: (id: string) => void;
  onNew: () => void;
  onSave: () => void | Promise<void>;
  onSaveAs: (name: string) => void | Promise<void>;
  onRename: (name: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
}

export function ProjectBar({
  projects,
  currentProject,
  dirty,
  onSelect,
  onNew,
  onSave,
  onSaveAs,
  onRename,
  onDelete,
}: ProjectBarProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [saveAsOpen, setSaveAsOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const openDialog = (setOpen: (open: boolean) => void) => {
    setMenuOpen(false);
    setOpen(true);
  };

  return (
    <div className="flex items-center gap-1">
      <div className="relative min-w-0 flex-1">
        <Select value={currentProject?.id ?? ''} onValueChange={onSelect}>
          <SelectTrigger size="sm" className="w-full" aria-label="Project">
            <span className="flex min-w-0 flex-1 items-center gap-1.5">
              {dirty && <span className="bg-primary size-1.5 shrink-0 rounded-full" title="Unsaved changes" />}
              <SelectValue placeholder="Untitled" />
            </span>
          </SelectTrigger>
          <SelectContent>
            {projects.length === 0 && (
              <div className="text-muted-foreground px-2 py-1.5 text-xs">No projects yet</div>
            )}
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                <span className="truncate">{p.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <IconButton label="New project" onClick={onNew}>
        <IconPlus />
      </IconButton>
      <IconButton
        label={currentProject ? 'Save' : 'Save as new project'}
        onClick={() => (currentProject ? void onSave() : setSaveAsOpen(true))}
        disabled={currentProject ? !dirty : false}
      >
        <IconDeviceFloppy />
      </IconButton>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Project actions">
                <IconDotsVertical />
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>Project actions</TooltipContent>
        </Tooltip>
        <PopoverContent className="w-44 p-0" align="end">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem value="save-as" onSelect={() => openDialog(setSaveAsOpen)}>
                  <IconCopyPlus />
                  Save as…
                </CommandItem>
                <CommandItem
                  value="rename"
                  disabled={!currentProject}
                  onSelect={() => openDialog(setRenameOpen)}
                >
                  <IconPencil />
                  Rename
                </CommandItem>
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  value="delete"
                  disabled={!currentProject}
                  className="text-destructive data-[selected=true]:text-destructive"
                  onSelect={() => openDialog(setDeleteOpen)}
                >
                  <IconTrash className="text-destructive" />
                  Delete
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <NameDialog
        open={saveAsOpen}
        onOpenChange={setSaveAsOpen}
        title="Save project as"
        fieldLabel="Project name"
        placeholder="Project name"
        defaultValue={currentProject ? `${currentProject.name} copy` : ''}
        onSubmit={async (name) => {
          await onSaveAs(name);
          toast.success(`Project "${name}" saved`);
        }}
      />
      <NameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename project"
        fieldLabel="Project name"
        placeholder="Project name"
        defaultValue={currentProject?.name ?? ''}
        confirmLabel="Rename"
        onSubmit={async (name) => {
          await onRename(name);
          toast.success('Project renamed');
        }}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title={`Delete "${currentProject?.name}"?`}
        description="This cannot be undone."
        onConfirm={async () => {
          await onDelete();
          toast.success('Project deleted');
        }}
      />
    </div>
  );
}
