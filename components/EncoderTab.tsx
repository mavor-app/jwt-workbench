import * as React from 'react';
import { toast } from 'sonner';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CopyButton } from '@/components/CopyButton';
import { ExpMenu } from '@/components/ExpMenu';
import { JsonEditor } from '@/components/JsonEditor';
import { ProjectBar } from '@/components/ProjectBar';
import { SecretPicker } from '@/components/SecretPicker';
import { TokenDisplay } from '@/components/TokenDisplay';
import { useProjects } from '@/hooks/useProjects';
import { useSecrets } from '@/hooks/useSecrets';
import { signJwt, JwtError, SUPPORTED_ALGS } from '@/lib/jwt';
import {
  DEFAULT_HEADER,
  DEFAULT_PAYLOAD,
  EMPTY_SECRET,
  resolveSecret,
  type SecretRef,
} from '@/lib/storage';

interface EncoderTabProps {
  currentProjectId: string | null;
  onSelectProject: (id: string | null) => void;
}

interface Draft {
  header: string;
  payload: string;
  secret: SecretRef;
}

const DEFAULT_DRAFT: Draft = {
  header: DEFAULT_HEADER,
  payload: DEFAULT_PAYLOAD,
  secret: EMPTY_SECRET,
};

export function EncoderTab({ currentProjectId, onSelectProject }: EncoderTabProps) {
  const { projects, loaded, createProject, updateProject, deleteProject } = useProjects();
  const { secrets } = useSecrets();

  const currentProject = projects.find((p) => p.id === currentProjectId) ?? null;
  const [draft, setDraft] = React.useState<Draft>(DEFAULT_DRAFT);
  const [result, setResult] = React.useState<{ token?: string; error?: string }>({});

  // Reload the draft whenever a different project is opened (or on first load).
  const loadedProjectRef = React.useRef<string | null | undefined>(undefined);
  React.useEffect(() => {
    if (!loaded) return;
    if (loadedProjectRef.current === currentProjectId) return;
    loadedProjectRef.current = currentProjectId;
    if (currentProject) {
      setDraft({ header: currentProject.header, payload: currentProject.payload, secret: currentProject.secret });
    } else {
      setDraft(DEFAULT_DRAFT);
    }
  }, [loaded, currentProjectId, currentProject]);

  const dirty = currentProject
    ? draft.header !== currentProject.header ||
      draft.payload !== currentProject.payload ||
      JSON.stringify(draft.secret) !== JSON.stringify(currentProject.secret)
    : draft.header !== DEFAULT_DRAFT.header ||
      draft.payload !== DEFAULT_DRAFT.payload ||
      JSON.stringify(draft.secret) !== JSON.stringify(DEFAULT_DRAFT.secret);

  // Algorithm shown in the header's action row, derived from the header JSON.
  const { headerAlg, headerParses } = React.useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(draft.header);
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        const alg = (parsed as Record<string, unknown>).alg;
        return { headerAlg: typeof alg === 'string' ? alg : undefined, headerParses: true };
      }
    } catch {
      // fall through
    }
    return { headerAlg: undefined, headerParses: false };
  }, [draft.header]);

  const setAlg = (alg: string) => {
    setDraft((d) => {
      try {
        const parsed = JSON.parse(d.header) as Record<string, unknown>;
        return { ...d, header: JSON.stringify({ ...parsed, alg }, null, 2) };
      } catch {
        return d;
      }
    });
  };

  // Re-sign live as the draft changes.
  const secretValue = resolveSecret(draft.secret, secrets);
  React.useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (!secretValue) {
        setResult({ error: 'Enter a secret to generate the token' });
        return;
      }
      try {
        const token = await signJwt(draft.header, draft.payload, secretValue);
        if (!cancelled) setResult({ token });
      } catch (e) {
        if (!cancelled) {
          setResult({ error: e instanceof JwtError ? e.message : 'Failed to sign token' });
        }
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draft.header, draft.payload, secretValue]);

  return (
    <div className="flex flex-col gap-3">
      <ProjectBar
        projects={projects}
        currentProject={currentProject}
        dirty={dirty}
        onSelect={(id) => onSelectProject(id)}
        onNew={() => {
          onSelectProject(null);
          loadedProjectRef.current = undefined; // force draft reset
        }}
        onSave={async () => {
          if (!currentProject) return;
          await updateProject(currentProject.id, draft);
          toast.success('Project saved');
        }}
        onSaveAs={async (name) => {
          const project = await createProject({ name, ...draft });
          onSelectProject(project.id);
          loadedProjectRef.current = project.id; // keep current draft
        }}
        onRename={async (name) => {
          if (currentProject) await updateProject(currentProject.id, { name });
        }}
        onDelete={async () => {
          if (!currentProject) return;
          await deleteProject(currentProject.id);
          onSelectProject(null);
          loadedProjectRef.current = undefined;
        }}
      />

      <JsonEditor
        label="Header"
        value={draft.header}
        onChange={(header) => setDraft((d) => ({ ...d, header }))}
        minRows={4}
        actions={
          <Select
            value={headerAlg && (SUPPORTED_ALGS as readonly string[]).includes(headerAlg) ? headerAlg : ''}
            onValueChange={setAlg}
            disabled={!headerParses}
          >
            <SelectTrigger size="sm" className="h-7 gap-1 px-2 text-xs" aria-label="Algorithm">
              <SelectValue placeholder="alg" />
            </SelectTrigger>
            <SelectContent align="end">
              {SUPPORTED_ALGS.map((alg) => (
                <SelectItem key={alg} value={alg}>
                  {alg}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <JsonEditor
        label="Payload"
        value={draft.payload}
        onChange={(payload) => setDraft((d) => ({ ...d, payload }))}
        minRows={8}
        actions={<ExpMenu payload={draft.payload} onChange={(payload) => setDraft((d) => ({ ...d, payload }))} />}
      />

      <div className="flex flex-col gap-1">
        <Label className="text-muted-foreground h-7 items-center text-xs uppercase tracking-wide">
          Secret
        </Label>
        <SecretPicker
          value={draft.secret}
          onChange={(secret) => setDraft((d) => ({ ...d, secret }))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex h-7 items-center justify-between">
          <Label className="text-muted-foreground text-xs uppercase tracking-wide">Token</Label>
          {result.token && <CopyButton text={result.token} label="Copy token" />}
        </div>
        <div className="bg-muted/40 min-h-16 rounded-md border p-3">
          {result.token ? (
            <TokenDisplay token={result.token} />
          ) : (
            <p className="text-muted-foreground text-xs">{result.error ?? '…'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
