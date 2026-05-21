'use client';

import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { AlertFilters } from '@/hooks/useAlertFilters';
import { ChevronDown } from 'lucide-react';

const SEVERITY_OPTIONS = ['critical', 'high', 'medium', 'low', 'info'];
const STATUS_OPTIONS = ['new', 'investigating', 'resolved', 'false_positive'];
const CATEGORY_OPTIONS = [
  'malware',
  'phishing',
  'unauthorized_access',
  'data_exfiltration',
  'policy_violation',
  'suspicious_login',
];
const SOURCE_OPTIONS = ['endpoint-agent', 'email-gateway', 'firewall', 'cloud-audit'];

function MultiSelectFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string | undefined;
  onChange: (val: string | undefined) => void;
}) {
  const selected = value ? value.split(',') : [];

  function toggle(opt: string) {
    const next = selected.includes(opt)
      ? selected.filter((s) => s !== opt)
      : [...selected, opt];
    onChange(next.length ? next.join(',') : undefined);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          {label}
          {selected.length > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-1.5">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="start">
        <div className="space-y-1">
          {options.map((opt) => (
            <label
              key={opt}
              className={cn(
                'flex items-center gap-2 px-2 py-1 rounded cursor-pointer text-sm',
                'hover:bg-muted',
              )}
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="accent-primary"
              />
              {opt.replace(/_/g, ' ')}
            </label>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

  const hasFilters =
    filters.severity ||
    filters.status ||
    filters.category ||
    filters.source ||
    filters.from ||
    filters.to ||
    filters.search;

  return (
    <div className="flex flex-wrap gap-2 items-end">
      <MultiSelectFilter
        label="Severity"
        options={SEVERITY_OPTIONS}
        value={filters.severity}
        onChange={(v) => onChange({ severity: v })}
      />
      <MultiSelectFilter
        label="Status"
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(v) => onChange({ status: v })}
      />
      <MultiSelectFilter
        label="Category"
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onChange={(v) => onChange({ category: v })}
      />
      <MultiSelectFilter
        label="Source"
        options={SOURCE_OPTIONS}
        value={filters.source}
        onChange={(v) => onChange({ source: v })}
      />

      <div className="flex flex-col gap-1">
        <Label className="text-xs">From</Label>
        <Input
          type="date"
          value={filters.from ?? ''}
          onChange={(e) => onChange({ from: e.target.value || undefined })}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label className="text-xs">To</Label>
        <Input
          type="date"
          value={filters.to ?? ''}
          onChange={(e) => onChange({ to: e.target.value || undefined })}
          className="h-8 text-sm"
        />
      </div>

      <Input
        placeholder="Search…"
        defaultValue={filters.search ?? ''}
        onChange={(e) => handleSearch(e.target.value)}
        className="h-8 w-52 text-sm"
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onChange({
              severity: undefined,
              status: undefined,
              category: undefined,
              source: undefined,
              from: undefined,
              to: undefined,
              search: undefined,
            })
          }
        >
          Clear
        </Button>
      )}
    </div>
  );
}
