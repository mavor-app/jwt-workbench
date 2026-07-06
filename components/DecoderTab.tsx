import * as React from 'react';
import { IconClipboard, IconFolderPlus } from '@tabler/icons-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { CopyButton } from '@/components/CopyButton';
import { HighlightedTextarea } from '@/components/HighlightedTextarea';
import { highlightJson, highlightJwt } from '@/components/highlight';
import { IconButton } from '@/components/IconButton';
import { NameDialog } from '@/components/NameDialog';
import { SecretPicker } from '@/components/SecretPicker';
import { useProjects } from '@/hooks/useProjects';
import { useSecrets } from '@/hooks/useSecrets';
import { decodeJwt, formatClaimDate, isExpired, isJwt, verifyJwt, type DecodedJwt } from '@/lib/jwt';
import { EMPTY_SECRET, resolveSecret, type SecretRef } from '@/lib/storage';

interface DecoderTabProps {
  onProjectCreated: (id: string) => void;
}

const DATE_CLAIMS = ['exp', 'iat', 'nbf'] as const;

function JsonBlock({ label, value }: { label: string; value: Record<string, unknown> }) {
  const json = JSON.stringify(value, null, 2);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex h-7 items-center justify-between">
        <Label className="text-muted-foreground text-xs uppercase tracking-wide">{label}</Label>
        <CopyButton text={json} label={`Copy ${label.toLowerCase()}`} />
      </div>
      <pre className="bg-muted/40 overflow-x-auto rounded-md border p-3 font-mono text-xs leading-relaxed">
        {highlightJson(json)}
      </pre>
    </div>
  );
}

export function DecoderTab({ onProjectCreated }: DecoderTabProps) {
  const { createProject } = useProjects();
  const { secrets } = useSecrets();
  const [token, setToken] = React.useState('');
  const [secret, setSecret] = React.useState<SecretRef>(EMPTY_SECRET);
  const [verified, setVerified] = React.useState<boolean | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  let decoded: DecodedJwt | null = null;
  let decodeError: string | null = null;
  if (token.trim()) {
    try {
      decoded = decodeJwt(token);
    } catch (e) {
      decodeError = (e as Error).message;
    }
  }

  const secretValue = resolveSecret(secret, secrets);
  React.useEffect(() => {
    let cancelled = false;
    if (!decoded || !secretValue) {
      setVerified(null);
      return;
    }
    verifyJwt(token, secretValue).then((ok) => {
      if (!cancelled) setVerified(ok);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, secretValue, !!decoded]);

  const decodeFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (isJwt(text)) {
        setToken(text.trim());
        toast.success('JWT decoded from clipboard');
      } else {
        toast.error('No JWT found in clipboard');
        textareaRef.current?.focus();
      }
    } catch {
      toast.error('Could not read clipboard');
      textareaRef.current?.focus();
    }
  };

  const expired = decoded ? isExpired(decoded.payload) : null;
  const dateClaims = decoded
    ? DATE_CLAIMS.map((claim) => ({ claim, date: formatClaimDate(decoded!.payload[claim]) })).filter(
        (c) => c.date !== null,
      )
    : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex h-7 items-center justify-between">
          <Label htmlFor="decoder-token" className="text-muted-foreground text-xs uppercase tracking-wide">
            Token
          </Label>
          <div className="flex items-center gap-1">
            {decoded && (
              <IconButton label="Create project from JWT" onClick={() => setCreateOpen(true)}>
                <IconFolderPlus />
              </IconButton>
            )}
            <IconButton label="Decode from clipboard" variant="secondary" onClick={() => void decodeFromClipboard()}>
              <IconClipboard />
            </IconButton>
          </div>
        </div>
        <HighlightedTextarea
          id="decoder-token"
          ref={textareaRef}
          rows={4}
          spellCheck={false}
          placeholder="Paste a JWT here, or use the clipboard button above"
          className="break-all"
          highlight={highlightJwt}
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        {decodeError && <p className="text-destructive text-xs">{decodeError}</p>}
      </div>

      {decoded && (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            {verified === null && <Badge variant="secondary">Signature not checked</Badge>}
            {verified === true && <Badge variant="success">Signature verified</Badge>}
            {verified === false && <Badge variant="destructive">Invalid signature</Badge>}
            {expired === true && <Badge variant="destructive">Expired</Badge>}
            {expired === false && <Badge variant="success">Not expired</Badge>}
          </div>

          <JsonBlock label="Header" value={decoded.header} />
          <JsonBlock label="Payload" value={decoded.payload} />

          {dateClaims.length > 0 && (
            <div className="text-muted-foreground flex flex-col gap-0.5 text-xs">
              {dateClaims.map(({ claim, date }) => (
                <div key={claim}>
                  <span className="font-mono font-medium">{claim}</span>: {date}
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <Label className="text-muted-foreground h-7 items-center text-xs uppercase tracking-wide">
              Verify signature (optional)
            </Label>
            <SecretPicker value={secret} onChange={setSecret} placeholder="Secret to verify with" />
          </div>
        </>
      )}

      <NameDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create project from JWT"
        description="The decoded header and payload become a new project."
        fieldLabel="Project name"
        placeholder="Project name"
        confirmLabel="Create"
        onSubmit={async (name) => {
          if (!decoded) return;
          const project = await createProject({
            name,
            header: JSON.stringify(decoded.header, null, 2),
            payload: JSON.stringify(decoded.payload, null, 2),
            secret,
          });
          toast.success(`Project "${name}" created`);
          onProjectCreated(project.id);
        }}
      />
    </div>
  );
}
