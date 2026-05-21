'use client';

import { useSearchParams } from 'next/navigation';
import { useAlertFilters } from '@/hooks/useAlertFilters';
import { useAlerts } from '@/hooks/useAlerts';
import AlertsFilters from '@/components/alerts/AlertsFilters';
import AlertsTable from '@/components/alerts/AlertsTable';
import AlertDetailPanel from '@/components/alerts/AlertDetailPanel';
import Pagination from '@/components/alerts/Pagination';

export default function AlertsView() {
  const { filters, setFilters, toggleSort } = useAlertFilters();
  const { data, isLoading } = useAlerts(filters);
  const searchParams = useSearchParams();
  const selectedAlertId = searchParams.get('alertId');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Alerts</h1>
      <AlertsFilters filters={filters} onChange={setFilters} />
      <div className="flex gap-4">
        <div className={selectedAlertId ? 'flex-1 min-w-0' : 'w-full'}>
          <AlertsTable
            alerts={data?.data ?? []}
            isLoading={isLoading}
            selectedId={selectedAlertId}
            onSort={toggleSort}
            sortBy={filters.sortBy}
            sortOrder={filters.sortOrder}
          />
          {data?.meta && (
            <Pagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={(p) => setFilters({ page: p })}
            />
          )}
        </div>
        {selectedAlertId && <AlertDetailPanel alertId={selectedAlertId} />}
      </div>
    </div>
  );
}
