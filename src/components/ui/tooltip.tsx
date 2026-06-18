import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: string
  children: ReactNode
  side?: 'top' | 'bottom'
}) {
  return (
    <div className="group relative inline-flex">
      {children}
      <div
        className={cn(
          'pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap',
          'rounded-md bg-zinc-900 px-2 py-1 text-xs text-white',
          'opacity-0 transition-opacity group-hover:opacity-100',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        )}
      >
        {content}
      </div>
    </div>
  )
}
