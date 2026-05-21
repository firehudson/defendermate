import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const severityStyles: Record<string, string> = {
  critical: 'bg-red-600 text-white hover:bg-red-600',
  high: 'bg-orange-500 text-white hover:bg-orange-500',
  medium: 'bg-yellow-500 text-black hover:bg-yellow-500',
  low: 'bg-blue-500 text-white hover:bg-blue-500',
  info: 'bg-gray-400 text-white hover:bg-gray-400',
};

export function SeverityBadge({ severity }: { severity: string }) {
  return (
    <Badge className={cn(severityStyles[severity] ?? 'bg-gray-300')}>
      {severity}
    </Badge>
  );
}
