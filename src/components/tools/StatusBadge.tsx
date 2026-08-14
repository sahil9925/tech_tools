import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, AlertTriangle, Minus } from 'lucide-react'

type StatusType = 'pass' | 'fail' | 'warning' | 'none' | 'valid' | 'invalid' | 'expired' | 'not-found' | 'healthy' | 'error' | 'active' | 'inactive' | 'degraded' | 'unknown' | 'neutral'

interface StatusBadgeProps {
  status: StatusType
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const STATUS_CONFIG: Record<StatusType, {
  icon: LucideIcon
  color: string
  label: string
}> = {
  pass: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', label: 'PASS' },
  valid: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', label: 'VALID' },
  healthy: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', label: 'HEALTHY' },
  active: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', label: 'ACTIVE' },
  fail: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'FAIL' },
  invalid: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'INVALID' },
  expired: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'EXPIRED' },
  error: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'ERROR' },
  inactive: { icon: XCircle, color: 'text-red-600 dark:text-red-400', label: 'INACTIVE' },
  warning: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', label: 'WARNING' },
  degraded: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', label: 'DEGRADED' },
  'not-found': { icon: Minus, color: 'text-muted-foreground', label: 'NOT FOUND' },
  none: { icon: Minus, color: 'text-muted-foreground', label: 'NONE' },
  neutral: { icon: Minus, color: 'text-muted-foreground', label: 'NEUTRAL' },
  unknown: { icon: Minus, color: 'text-muted-foreground', label: 'UNKNOWN' },
}

export function StatusBadge({ status, label, size = 'md', className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.none
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-1.5',
    lg: 'text-base gap-2',
  }

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  return (
    <span className={cn('inline-flex items-center font-semibold', config.color, sizeClasses[size], className)}>
      <Icon className={iconSizes[size]} />
      {label ?? config.label}
    </span>
  )
}
