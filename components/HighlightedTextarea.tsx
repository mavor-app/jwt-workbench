import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface HighlightedTextareaProps extends React.ComponentProps<typeof Textarea> {
  highlight: (text: string) => React.ReactNode;
}

/**
 * Textarea with syntax highlighting: the text itself is transparent and a
 * highlighted <pre> with identical metrics sits underneath.
 */
export const HighlightedTextarea = React.forwardRef<HTMLTextAreaElement, HighlightedTextareaProps>(
  function HighlightedTextarea({ highlight, className, value, ...props }, ref) {
    const text = String(value ?? '');
    return (
      <div className="relative">
        <pre
          aria-hidden
          className={cn(
            // Must mirror the textarea's box exactly: border width, padding, font, wrapping.
            'pointer-events-none absolute inset-0 overflow-hidden rounded-md border border-transparent px-3 py-2 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap',
            className,
          )}
        >
          {highlight(text)}
          {'\n'}
        </pre>
        <Textarea
          ref={ref}
          value={value}
          className={cn(
            'relative bg-transparent font-mono text-xs leading-relaxed break-words text-transparent caret-foreground selection:bg-primary/20',
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
