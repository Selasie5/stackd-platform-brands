import type { ReactNode } from 'react'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { SpleenetLoader, type SpleenetLoaderSize, type SpleenetLoaderTone } from '@/components/ui/spleenet-loader'

export function ViewCenter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-viewport-content w-full flex-col items-center justify-center px-6 py-12 text-center',
        className
      )}
    >
      {children}
    </div>
  )
}

export function LoadingView({
  label = 'Loading…',
  tone = 'muted',
  size = 'lg',
  className,
}: {
  label?: string
  tone?: SpleenetLoaderTone
  size?: SpleenetLoaderSize
  className?: string
}) {
  return (
    <ViewCenter className={className}>
      <div className="flex flex-col items-center gap-4">
        <SpleenetLoader size={size} tone={tone} label={label} />
        {label ? <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p> : null}
      </div>
    </ViewCenter>
  )
}

export function EmptyView({
  title,
  description,
  children,
  className,
  illustration,
}: {
  title: string
  description?: string
  children?: ReactNode
  className?: string
  illustration?: ReactNode
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      action={children}
      illustration={illustration}
      className={className}
    />
  )
}
