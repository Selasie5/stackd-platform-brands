import { cn } from '@/lib/utils'

export function DotBadge({
  label,
  badgeClassName,
  dotClassName,
  className,
}: {
  label: string
  badgeClassName: string
  dotClassName: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
        badgeClassName,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotClassName)} aria-hidden="true" />
      {label}
    </span>
  )
}
