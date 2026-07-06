import * as React from 'react';
import { IconIndentIncrease } from '@tabler/icons-react';

import { Label } from '@/components/ui/label';
import { HighlightedTextarea } from '@/components/HighlightedTextarea';
import { highlightJson } from '@/components/highlight';
import { IconButton } from '@/components/IconButton';
import { cn } from '@/lib/utils';

interface JsonEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  minRows?: number;
  /** Extra controls rendered in the label row, before the format button. */
  actions?: React.ReactNode;
}

function jsonError(text: string): string | null {
  try {
    JSON.parse(text);
    return null;
  } catch (e) {
    return (e as Error).message;
  }
}

export function JsonEditor({ label, value, onChange, className, minRows = 4, actions }: JsonEditorProps) {
  const error = jsonError(value);
  const id = React.useId();

  const format = () => {
    try {
      onChange(JSON.stringify(JSON.parse(value), null, 2));
    } catch {
      // invalid JSON — nothing to format
    }
  };

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex h-7 items-center justify-between">
        <Label htmlFor={id} className="text-muted-foreground text-xs uppercase tracking-wide">
          {label}
        </Label>
        <div className="flex items-center gap-1">
          {actions}
          <IconButton label="Format JSON" onClick={format} disabled={!!error}>
            <IconIndentIncrease />
          </IconButton>
        </div>
      </div>
      <HighlightedTextarea
        id={id}
        rows={minRows}
        spellCheck={false}
        highlight={highlightJson}
        className={cn(error && 'border-destructive')}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  );
}
