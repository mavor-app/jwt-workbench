import * as React from 'react';
import { cn } from '@/lib/utils';

/** Render a JWT with jwt.io-style colored sections. */
export function TokenDisplay({ token, className }: { token: string; className?: string }) {
  const [header = '', payload = '', signature = ''] = token.split('.');
  return (
    <code className={cn('font-mono text-xs break-all whitespace-pre-wrap', className)}>
      <span className="text-token-header">{header}</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-token-payload">{payload}</span>
      <span className="text-muted-foreground">.</span>
      <span className="text-token-signature">{signature}</span>
    </code>
  );
}
