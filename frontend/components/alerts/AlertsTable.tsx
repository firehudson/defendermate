'use client';

import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { SeverityBadge } from './SeverityBadge';
import { StatusBadge } from './StatusBadge';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Alert } from '@/types/alert';

interface Props {
  alerts: Alert[];
  isLoading: boolean;
  selectedId: string | null;
  onSort: (field: 'timestamp' | 'severity') => void;
  sortBy?: string;
  sortOrder?: string;
}

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy?: string; sortOrder?: string }) {
  if (sortBy !== field) return <ChevronsUpDown className="h-3 w-3 ml-1 opacity-40" />;
  if (sortOrder === 'asc') return <ChevronUp className="h-3 w-3 ml-1" />;
  return <ChevronDown className="h-3 w-3 ml-1" />;
}

export default function AlertsTable({ alerts, isLoading, selectedId, onSort, sortBy, sortOrder }: Props) {
  const router = useRouter();

  function handleRowClick(id: string) {
    const params = new URLSearchParams(window.location.search);
    params.set('alertId', id);
    router.push(`?${params.toString()}`, { scroll: false });
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="cursor-pointer select-none"
            onClick={() => onSort('timestamp')}
          >
            <span className="flex items-center">
              Time
              <SortIcon field="timestamp" sortBy={sortBy} sortOrder={sortOrder} />
            </span>
          </TableHead>
          <TableHead>Title</TableHead>
          <TableHead
            className="cursor-pointer select-none"
            onClick={() => onSort('severity')}
          >
            <span className="flex items-center">
              Severity
              <SortIcon field="severity" sortBy={sortBy} sortOrder={sortOrder} />
            </span>
          </TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead>Assignee</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {alerts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
              No alerts found
            </TableCell>
          </TableRow>
        ) : (
          alerts.map((alert) => (
            <TableRow
              key={alert.id}
              className={cn('cursor-pointer', selectedId === alert.id && 'bg-muted')}
              onClick={() => handleRowClick(alert.id)}
            >
              <TableCell className="text-xs whitespace-nowrap">
                {new Date(alert.timestamp).toLocaleString()}
              </TableCell>
              <TableCell className="max-w-[260px] truncate text-sm">{alert.title}</TableCell>
              <TableCell><SeverityBadge severity={alert.severity} /></TableCell>
              <TableCell><StatusBadge status={alert.status} /></TableCell>
              <TableCell className="text-xs">{alert.category.replace(/_/g, ' ')}</TableCell>
              <TableCell className="text-xs">{alert.source}</TableCell>
              <TableCell className="text-xs font-mono truncate max-w-[120px]">{alert.affectedAsset}</TableCell>
              <TableCell className="text-xs">{alert.assignee ?? '—'}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
