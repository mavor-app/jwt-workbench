import * as React from 'react';
import { IconClock, IconClockX } from '@tabler/icons-react';

import { cn } from '@/lib/utils';

interface ExpStatusProps {
  /** Raw payload JSON text. */
  payload: string;
}

function parseExp(payload: string): number | null {
  try {
    const value: unknown = JSON.parse(payload);
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const exp = (value as Record<string, unknown>).exp;
      if (typeof exp === 'number' && Number.isFinite(exp)) return exp;
    }
  } catch {
    // invalid JSON — nothing to show
  }
  return null;
}

/** Shows the payload's `exp` claim as a local date, green while valid and red once expired. */
export function ExpStatus({ payload }: ExpStatusProps) {
  const exp = parseExp(payload);
  const [now, setNow] = React.useState(() => Date.now());

  // Tick while an exp is shown so the countdown and expired state stay current.
  React.useEffect(() => {
    if (exp === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [exp === null]);

  if (exp === null) return null;

  const expMs = exp * 1000;
  const expired = expMs < now;
  const Icon = expired ? IconClockX : IconClock;

  return (
    <p
      className={cn(
        'flex items-center gap-1 text-xs',
        expired ? 'text-destructive' : 'text-success',
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="font-mono font-medium">exp</span>
      <span className="truncate">{new Date(expMs).toLocaleString()}</span>
    </p>
  );
}
