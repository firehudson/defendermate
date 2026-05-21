'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AlertFilters } from '@/hooks/useAlertFilters';

interface Props {
  filters: AlertFilters;
  onChange: (f: Partial<AlertFilters>) => void;
}

export default function AlertsFilters({ filters, onChange }: Props) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearch(val: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // no cleanup on unmount — debounce fires stale after unmount
    debounceRef.current = setTimeout(() => {
      onChange({ search: val || undefined });
    }, 400);
  }

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <Label>Search</Label>
        <Input
          placeholder="Search alerts…"
          defaultValue={filters.search ?? ''}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-64"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>From</Label>
        <Input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label>To</Label>
        <Input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}
