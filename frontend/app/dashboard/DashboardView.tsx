'use client';

import { useRouter } from 'next/navigation';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAlertStats } from '@/hooks/useAlertStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
  info: '#9ca3af',
};

function StatCard({
  title,
  value,
  variant,
}: {
  title: string;
  value: number;
  variant?: 'danger' | 'warning';
}) {
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-muted-foreground">{title}</p>
        <p
          className={`text-3xl font-bold mt-1 ${
            variant === 'danger'
              ? 'text-red-500'
              : variant === 'warning'
              ? 'text-orange-500'
              : ''
          }`}
        >
          {value.toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}

export default function DashboardView() {
  const router = useRouter();
  const { data, isLoading } = useAlertStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalAlerts = data.bySeverity.reduce((s: number, r: any) => s + r.count, 0);
  const criticalCount = data.bySeverity.find((r: any) => r.severity === 'critical')?.count ?? 0;
  const openCount = data.byStatus
    .filter((r: any) => r.status === 'new' || r.status === 'investigating')
    .reduce((s: number, r: any) => s + r.count, 0);
  const investigatingCount =
    data.byStatus.find((r: any) => r.status === 'investigating')?.count ?? 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Alerts" value={totalAlerts} />
        <StatCard title="Critical" value={criticalCount} variant="danger" />
        <StatCard title="Open" value={openCount} variant="warning" />
        <StatCard title="Investigating" value={investigatingCount} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.bySeverity}
                  dataKey="count"
                  nameKey="severity"
                  innerRadius={50}
                  outerRadius={80}
                  onClick={(item) =>
                    router.push(
                      `/alerts?${new URLSearchParams({ severity: item.severity }).toString()}`,
                    )
                  }
                  className="cursor-pointer"
                >
                  {data.bySeverity.map((entry: any) => (
                    <Cell
                      key={entry.severity}
                      fill={SEVERITY_COLORS[entry.severity] ?? '#9ca3af'}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [v, 'Alerts']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tick={{ fontSize: 10 }}
                  width={110}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  onClick={(value) =>
                    router.push(
                      `/alerts?${new URLSearchParams({ category: value.category }).toString()}`,
                    )
                  }
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">By Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.byStatus}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                  onClick={(item) =>
                    router.push(
                      `/alerts?${new URLSearchParams({ status: item.status }).toString()}`,
                    )
                  }
                  className="cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
