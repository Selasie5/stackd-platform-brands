import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function BriefSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className="space-y-5 border-b border-zinc-100 pb-10 last:border-b-0 last:pb-0">
      <div>
        <h2 className="text-lg font-semibold tracking-[-0.02em] text-zinc-900">{title}</h2>
        {description && (
          <p className="mt-1 text-sm leading-relaxed text-zinc-500">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  )
}

export function BriefField({
  label,
  hint,
  required,
  children,
  className,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <div>
        <p className="text-sm font-medium text-zinc-800">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </p>
      </div>
      {children}
      {hint && <p className="mt-0.5 text-xs leading-relaxed text-zinc-400">{hint}</p>}

    </div>
  )
}

export function BriefProse({ children }: { children: ReactNode }) {
  return (
    <p className="text-sm leading-relaxed text-zinc-600">{children}</p>
  )
}
