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
}: {
  title: string
  description?: string
  action?: ReactNode
  illustration?: ReactNode
  className?: string
}) {
  return (
    <ViewCenter className={className}>
      <div className="mx-auto flex w-full max-w-[420px] flex-col items-center text-center">
        <div className="mb-8">{illustration ?? <EmptyStateFolderIllustration />}</div>

        <h2 className="text-[22px] font-semibold leading-snug tracking-[-0.02em] text-zinc-900 dark:text-zinc-50">
          {title}
        </h2>

        {description ? (
          <p className="mt-3 max-w-[640px] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        ) : null}

        {action ? <div className={cn('mt-8', description ? '' : 'mt-6')}>{action}</div> : null}
      </div>
    </ViewCenter>
  )
}
