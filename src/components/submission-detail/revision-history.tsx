import { FileEdit, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RevisionEvent {
  round: number
  versionLabel: string
  status: 'submitted' | 'revision_requested' | 'resubmitted'
  submittedAt: string
  note?: string | null
  videoUrl?: string | null
}

function RevisionIcon({ status }: { status: RevisionEvent['status'] }) {
  switch (status) {
    case 'submitted':
    case 'resubmitted':
      return <Eye className="h-3.5 w-3.5" />
    case 'revision_requested':
      return <FileEdit className="h-3.5 w-3.5" />
  }
}

export function RevisionHistory({ events }: { events: RevisionEvent[] }) {
  if (events.length === 0) return null

  return (
    <div className="rounded-lg border border-zinc-200 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Revision history
      </h3>

      <div className="mt-3 space-y-0">
        {events.map((event, i) => {
          const isLast = i === events.length - 1
          const isRevision = event.status === 'revision_requested'

          return (
            <div key={i} className={cn('relative flex gap-3 pb-4', isLast && 'pb-0')}>
              {!isLast && (
                <div className="absolute left-[7px] top-4 bottom-0 w-px bg-zinc-200" />
              )}

              <div
                className={cn(
                  'relative z-10 mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full',
                  isRevision ? 'bg-amber-100 text-amber-600' : 'bg-zinc-100 text-zinc-500'
                )}
              >
                <RevisionIcon status={event.status} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-zinc-800">
                    {event.versionLabel}
                  </p>
                  <span className="shrink-0 text-[11px] text-zinc-400">
                    {new Date(event.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {event.note && (
                  <p className="mt-0.5 text-xs text-zinc-500">{event.note}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
