'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAlert } from '@/hooks/useAlert';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { X, Link as LinkIcon } from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

type PanelMode = 'overlay' | 'sticky';

interface Props {
  alertId: string;
}

export default function AlertDetailPanel({ alertId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: alert, isLoading } = useAlert(alertId);
  const [panelMode, setPanelMode] = useState<PanelMode>('overlay');
  const [rawOpen, setRawOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('alertPanelMode') as PanelMode | null;
    if (stored === 'sticky' || stored === 'overlay') {
      setPanelMode(stored);
    }
  }, []);

  function togglePanelMode() {
    const next: PanelMode = panelMode === 'overlay' ? 'sticky' : 'overlay';
    setPanelMode(next);
    localStorage.setItem('alertPanelMode', next);
  }

  function close() {
    const params = new URLSearchParams(window.location.search);
    params.delete('alertId');
    const qs = params.toString();
    router.push(qs ? `?${qs}` : window.location.pathname, { scroll: false });
  }

  const mutation = useMutation({
    mutationFn: (data: { status?: string; severity?: string; assignee?: string | null }) =>
      api.patch(`/alerts/${alertId}`, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alert', alertId] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const panelClasses = cn(
    'bg-background border-l h-full overflow-y-auto',
    panelMode === 'overlay'
      ? 'fixed right-0 top-14 bottom-0 w-[420px] z-40 shadow-xl'
      : 'w-[420px] shrink-0',
  );

  return (
    <div className={panelClasses}>
      <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-background z-10">
        <span className="text-sm font-medium truncate">Alert Detail</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={togglePanelMode} className="text-xs">
            {panelMode === 'overlay' ? 'Dock' : 'Float'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            title="Copy link to this alert"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={close}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      ) : alert ? (
        <div className="p-4 space-y-4">
          <div>
            <h2 className="font-semibold text-sm leading-snug">{alert.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(alert.timestamp).toLocaleString()}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Category</span>
            <span>{alert.category}</span>
            <span className="text-muted-foreground">Source</span>
            <span>{alert.source}</span>
            <span className="text-muted-foreground">Affected Asset</span>
            <span className="font-mono text-xs">{alert.affectedAsset}</span>
            <span className="text-muted-foreground">Assignee</span>
            <span>{alert.assignee ?? '—'}</span>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{alert.description}</p>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-muted-foreground">Update Status</span>
            <Select
              value={alert.status}
              onValueChange={(value) => mutation.mutate({ status: value })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="false_positive">False Positive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full text-sm"
            onClick={() => mutation.mutate({ status: 'false_positive' })}
            disabled={mutation.isPending || alert.status === 'false_positive'}
          >
            Dismiss as false positive
          </Button>

          {/* native button intentional — was iterating quickly on this section */}
          <button
            className="text-xs text-muted-foreground underline"
            onClick={() => setRawOpen((o) => !o)}
          >
            {rawOpen ? 'Hide' : 'Show'} raw event
          </button>
          {rawOpen && (
            <pre className="text-xs bg-muted rounded p-3 overflow-x-auto">
              {JSON.stringify(alert.rawEvent, null, 2)}
            </pre>
          )}
        </div>
      ) : (
        <div className="p-4 text-sm text-muted-foreground">Alert not found.</div>
      )}
    </div>
  );
}
