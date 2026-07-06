import * as React from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { toast } from 'sonner';
import { IconButton } from '@/components/IconButton';

interface CopyButtonProps extends Omit<React.ComponentProps<typeof IconButton>, 'label' | 'children'> {
  /** The text to copy, or a getter for it. */
  text: string | (() => string);
  label?: string;
}

export function CopyButton({ text, label = 'Copy', ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = async () => {
    const value = typeof text === 'function' ? text() : text;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copied to clipboard');
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  React.useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <IconButton label={copied ? 'Copied!' : label} onClick={copy} {...props}>
      {copied ? <IconCheck className="text-success" /> : <IconCopy />}
    </IconButton>
  );
}
