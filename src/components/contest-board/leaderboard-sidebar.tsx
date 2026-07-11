import { Trophy, Eye, Heart } from 'lucide-react'
import type { ContestSubmission } from '@/hooks/use-contest-board'
import { cn } from '@/lib/utils'

function formatCompactNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const RANK_COLORS = [
  'text-amber-500',
  'text-zinc-400',
  'text-orange-600',
]

export function LeaderboardSidebar({
  entries,
  loading,
}: {
  entries: ContestSubmission[]
  loading: boolean
}) {
  const sorted = [...entries].sort((a, b) => b.leaderboardScore - a.leaderboardScore)
  const topEntries = sorted.slice(0, 10)

  return (
    <aside className="w-full shrink-0 lg:w-80">
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-zinc-100 px-4 py-3">
          <h3 className="text-sm font-semibold text-zinc-900">Leaderboard</h3>
          <p className="text-xs text-zinc-500">Top ranked submissions</p>
        </div>

        {loading && entries.length === 0 ? (
          <div className="space-y-3 px-4 py-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-zinc-200" />
                <div className="h-8 w-12 rounded bg-zinc-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-24 rounded bg-zinc-200" />
                  <div className="h-2 w-16 rounded bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        ) : topEntries.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Trophy className="mx-auto h-8 w-8 text-zinc-300" />
            <p className="mt-2 text-sm text-zinc-500">No ranked entries yet</p>
            <p className="text-xs text-zinc-400">
              Scores will appear once submissions are evaluated.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {topEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50',
                  entry.status === 'winner' && 'bg-amber-50/40'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold',
                    RANK_COLORS[index] ?? 'text-zinc-500'
                  )}
                >
                  {index < 3 ? (
                    <Trophy className={cn('h-4 w-4', RANK_COLORS[index])} />
                  ) : (
                    `#${index + 1}`
                  )}
                </span>

                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-zinc-200">
                  {entry.thumbnailUrl ? (
                    <img
                      src={entry.thumbnailUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-zinc-400">
                      No thumb
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-zinc-900">
                    #{entry.creatorId.slice(0, 8)}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-zinc-400">
                    <span className="inline-flex items-center gap-0.5">
                      <Eye className="h-2.5 w-2.5" aria-hidden="true" />
                      {formatCompactNumber(entry.submittedViews)}
                    </span>
                    <span className="inline-flex items-center gap-0.5">
                      <Heart className="h-2.5 w-2.5" aria-hidden="true" />
                      {formatCompactNumber(entry.engagementCount)}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-xs font-semibold text-zinc-800">{entry.leaderboardScore}</p>
                  <p className="text-[10px] text-zinc-400">pts</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
