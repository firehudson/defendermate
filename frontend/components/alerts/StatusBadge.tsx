import { Badge } from '@/components/ui/badge';

const statusLabels: Record<string, string> = {
  new: 'New',
  investigating: 'Investigating',
  resolved: 'Resolved',
  false_positive: 'False Positive',
};

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'destructive',
  investigating: 'default',
  resolved: 'secondary',
  false_positive: 'outline',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariants[status] ?? 'secondary'}>
      {statusLabels[status] ?? status}
    </Badge>
  );
}
