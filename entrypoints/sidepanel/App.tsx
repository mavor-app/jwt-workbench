import * as React from 'react';
import { IconBraces, IconZoomCode } from '@tabler/icons-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { DecoderTab } from '@/components/DecoderTab';
import { EncoderTab } from '@/components/EncoderTab';
import { store } from '@/lib/storage';

export default function App() {
  const [tab, setTab] = React.useState('encoder');
  const [currentProjectId, setCurrentProjectId] = React.useState<string | null>(null);
  const [restored, setRestored] = React.useState(false);

  // Restore last opened tab + project once on mount.
  React.useEffect(() => {
    Promise.all([store.lastTab.getValue(), store.lastOpenedProjectId.getValue(), store.projects.getValue()]).then(
      ([lastTab, lastProjectId, projects]) => {
        if (lastTab === 'encoder' || lastTab === 'decoder') setTab(lastTab);
        if (lastProjectId && projects.some((p) => p.id === lastProjectId)) {
          setCurrentProjectId(lastProjectId);
        }
        setRestored(true);
      },
    );
  }, []);

  const selectTab = (next: string) => {
    setTab(next);
    void store.lastTab.setValue(next);
  };

  const selectProject = (id: string | null) => {
    setCurrentProjectId(id);
    void store.lastOpenedProjectId.setValue(id);
  };

  if (!restored) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Tabs value={tab} onValueChange={selectTab} className="flex-1 gap-0">
        <div className="bg-background sticky top-0 z-10 border-b p-2">
          <TabsList className="w-full">
            <TabsTrigger value="encoder">
              <IconBraces />
              Encoder
            </TabsTrigger>
            <TabsTrigger value="decoder">
              <IconZoomCode />
              Decoder
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="encoder" className="p-3">
          <EncoderTab currentProjectId={currentProjectId} onSelectProject={selectProject} />
        </TabsContent>
        <TabsContent value="decoder" className="p-3">
          <DecoderTab
            onProjectCreated={(id) => {
              selectProject(id);
              selectTab('encoder');
            }}
          />
        </TabsContent>
      </Tabs>
      <Toaster position="bottom-center" />
    </div>
  );
}
