import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface IconButtonProps extends React.ComponentProps<typeof Button> {
  /** Tooltip text and accessible label. */
  label: string;
}

/** Icon-only button with a tooltip. The whole UI uses these instead of text buttons. */
export function IconButton({ label, children, variant = 'ghost', size = 'icon-sm', ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={variant} size={size} aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
