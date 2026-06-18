import type { ReactNode } from 'react'
import { ViewCenter } from '@/components/ui/view-state'
import { EmptyStateFolderIllustration } from '@/components/ui/empty-state-illustration'
import { Button } from '@/components/ui/button'
import type { ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function EmptyStateActionButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={cn(
        'h-11 rounded-full bg-zinc-900 px-6 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white',
        className
      )}
      {...props}
    />
  )
}

export function EmptyState({
  title,
  description,
  action,
  illustration,
  className,
  compact = false,
  embedded = false,
}: {
  title: string
  description?: string
  action?: ReactNode
  illustration?: ReactNode
  className?: string
  compact?: boolean
  embedded?: boolean
}) {
  return (
    <ViewCenter
      className={cn(
        compact && 'min-h-0 justify-center',
        embedded ? 'px-4 py-6' : compact ? 'py-10' : undefined,
        className
      )}
    >
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center text-center">
        <div className={cn(embedded ? 'mb-4 scale-90' : 'mb-8')}>
          {illustration ?? <EmptyStateFolderIllustration />}
        </div>

        <h2
          className={cn(
            'font-semibold leading-snug tracking-[-0.02em] text-zinc-900 dark:text-zinc-50',
            embedded ? 'text-base' : 'text-[22px]'
          )}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={cn(
              'mt-2 max-w-[640px] leading-relaxed text-zinc-500 dark:text-zinc-400',
              embedded ? 'text-xs' : 'mt-3 text-sm'
            )}
          >
            {description}
          </p>
        ) : null}

        {action ? (
          <div className={cn(embedded ? 'mt-4' : description ? 'mt-8' : 'mt-6')}>{action}</div>
        ) : null}
      </div>
    </ViewCenter>
  )
}
